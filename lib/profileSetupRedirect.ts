export const getCompletedProfileRedirect = ({
  isSignupFlow,
  localePath,
}: {
  isSignupFlow: boolean;
  localePath: string;
}) => (isSignupFlow ? '/account/thanks' : localePath);
