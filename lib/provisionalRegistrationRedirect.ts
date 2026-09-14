type RegistrationMember = {
  id?: string;
  email?: string;
  username?: string;
};

const appendMemberParams = (
  query: URLSearchParams,
  member: RegistrationMember | undefined,
  fallbackEmail: string,
) => {
  if (member?.username) query.set('name', member.username);
  if (member?.id) query.set('user_id', member.id);

  const email = member?.email ?? fallbackEmail;
  if (email) query.set('email', email);
};

export const buildProvisionalRegistrationThanksPath = (
  member: RegistrationMember | undefined,
  fallbackEmail: string,
): string => {
  const query = new URLSearchParams();
  appendMemberParams(query, member, fallbackEmail);
  const search = query.toString();
  return `/register/thanks${search ? `?${search}` : ''}`;
};

export const buildRegistrationDetailsPath = (
  queryParams: Record<string, string | string[] | undefined>,
): string => {
  const query = new URLSearchParams();

  for (const key of ['name', 'user_id', 'email'] as const) {
    const value = queryParams[key];
    const normalizedValue = Array.isArray(value) ? value[0] : value;
    if (normalizedValue) query.set(key, normalizedValue);
  }

  const search = query.toString();
  return `/register/test${search ? `?${search}` : ''}`;
};
