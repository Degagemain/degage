export const CAR_SHARING_PATH = '/app/car-sharing';
export const CAR_SHARING_HOME_PATH = '/app';

export type CarSharingFlag = 'loading' | 'enabled' | 'disabled';

export type CarSharingAccess = 'wait' | 'sign-in' | 'home' | 'page';

export const carSharingAccess = (signedIn: boolean, flag: CarSharingFlag): CarSharingAccess => {
  if (!signedIn) return 'sign-in';
  if (flag === 'loading') return 'wait';
  if (flag === 'disabled') return 'home';
  return 'page';
};
