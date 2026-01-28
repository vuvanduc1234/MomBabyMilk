const buildStorageKey = (userId) => `account_addresses_${userId || "guest"}`;

const readStorage = (userId) => {
  const key = buildStorageKey(userId);
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
};

const writeStorage = (userId, addresses) => {
  const key = buildStorageKey(userId);
  localStorage.setItem(key, JSON.stringify(addresses));
  return addresses;
};

const normalizeDefault = (addresses, defaultId) => {
  if (!addresses.length) return addresses;
  return addresses.map((item, index) => ({
    ...item,
    isDefault: defaultId ? item.id === defaultId : index === 0,
  }));
};

export const listAddresses = async (userId) => {
  return readStorage(userId);
};

export const createAddress = async (userId, payload) => {
  const addresses = readStorage(userId);
  const newId = `addr-${Date.now()}`;
  const nextList = [...addresses, { ...payload, id: newId }];
  const normalized = payload.isDefault
    ? normalizeDefault(nextList, newId)
    : nextList;
  return writeStorage(userId, normalized);
};

export const updateAddress = async (userId, id, payload) => {
  const addresses = readStorage(userId);
  const nextList = addresses.map((item) =>
    item.id === id ? { ...item, ...payload } : item,
  );
  const normalized = payload.isDefault
    ? normalizeDefault(nextList, id)
    : nextList;
  return writeStorage(userId, normalized);
};

export const deleteAddress = async (userId, id) => {
  const addresses = readStorage(userId);
  const nextList = addresses.filter((item) => item.id !== id);
  const normalized = nextList.some((item) => item.isDefault)
    ? nextList
    : normalizeDefault(nextList);
  return writeStorage(userId, normalized);
};

export const setDefaultAddress = async (userId, id) => {
  const addresses = readStorage(userId);
  const normalized = normalizeDefault(addresses, id);
  return writeStorage(userId, normalized);
};
