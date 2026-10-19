export const DEFAULT_ROOT_FOLDER_FILTERS = {
  name: "",
  fromDate: "",
  toDate: "",
  description: "",
};

export const buildRootFolderParams = (filters = DEFAULT_ROOT_FOLDER_FILTERS) =>
  Object.fromEntries(
    Object.entries({
      name: filters.name?.trim(),
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      description: filters.description?.trim(),
    }).filter(([, value]) => value)
  );
