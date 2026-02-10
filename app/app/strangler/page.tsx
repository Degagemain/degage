'use client';

import { useState } from 'react';

import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Field, FieldContent, FieldLabel } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

interface ParsedCookie {
  name: string;
  value: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
  expires?: string;
  sameSite?: string;
}

interface InfosessionRow {
  tijdstip: string;
  wijk: string;
  type: string;
  inschrijvingen: string;
  gastvrouwGastheer: string;
  enrollId: string | null;
  enrollUrl: string | null;
}

interface LoginResult {
  cookies: ParsedCookie[];
  status: number;
}

function buildCookieHeader(cookies: ParsedCookie[]): string {
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

export default function StranglerPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [infosessions, setInfosessions] = useState<InfosessionRow[] | null>(null);
  const [loading, setLoading] = useState<'login' | 'simulate' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoginResult(null);
    setInfosessions(null);
    setLoading('login');
    try {
      const res = await fetch('/api/strangler/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0]?.message ?? data.code ?? 'Login failed');
        return;
      }
      setLoginResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(null);
    }
  }

  async function handleSimulateRequest() {
    if (!loginResult?.cookies?.length) {
      setError('Login first to get cookies');
      return;
    }
    setError(null);
    setLoading('simulate');
    try {
      const cookieHeader = buildCookieHeader(loginResult.cookies);
      const res = await fetch('/api/strangler/simulate-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieHeader }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0]?.message ?? data.code ?? 'Simulate request failed');
        return;
      }
      setInfosessions(data.infosessions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulate request failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Strangler pattern – test</h1>
      <p className="text-muted-foreground mb-6 text-sm">Login via degapp.be and inspect cookies; then simulate a request with those cookies.</p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Credentials are sent to the API, which posts to degapp.be and returns parsed cookies.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading !== null}
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <FieldContent>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading !== null} />
              </FieldContent>
            </Field>
            <Button type="submit" disabled={loading !== null}>
              {loading === 'login' ? 'Logging in…' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive border-destructive/20 mb-6 rounded-md border px-4 py-3 text-sm">{error}</div>
      )}

      {loginResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cookie info (from login)</CardTitle>
            <CardDescription>Parsed from Set-Cookie. Status: {loginResult.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-auto rounded-md p-4 text-xs">{JSON.stringify(loginResult.cookies, null, 2)}</pre>
            <Button type="button" variant="outline" className="mt-4" onClick={handleSimulateRequest} disabled={loading !== null}>
              {loading === 'simulate' ? 'Calling…' : 'Simulate request'}
            </Button>
          </CardContent>
        </Card>
      )}

      {infosessions !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Infosessies</CardTitle>
            <CardDescription>Main table from degapp.be/infosession. Raw HTML is logged in the server console.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[28rem] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tijdstip</TableHead>
                    <TableHead>Wijk</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Inschrijvingen</TableHead>
                    <TableHead>Gastvrouw / gastheer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {infosessions.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="whitespace-nowrap">{row.tijdstip}</TableCell>
                      <TableCell>{row.wijk}</TableCell>
                      <TableCell className="min-w-[12rem]">{row.type}</TableCell>
                      <TableCell className="text-right">{row.inschrijvingen}</TableCell>
                      <TableCell>{row.gastvrouwGastheer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
