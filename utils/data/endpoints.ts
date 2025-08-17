// Centralized API endpoints
export const ENDPOINTS = {
  auth: {
    signIn: '/accounting/sign_in',
  },
  favorites: {
    save: '/service/pds/v1/favorites/save',
    delete: '/service/pds/v1/favorites/delete',
    getEntities: '/service/pds/v1/favorites/get_entities',
  },
  bonuses: {
    getAnyBonusCount: '/accounting/api/crm_roxy/getanybonuscount',
  },
} as const;
