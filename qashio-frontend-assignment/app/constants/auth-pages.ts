export const AUTH_PAGES = {
  signIn: {
    title: 'Sign in',
    submitLabel: 'Sign in',
    linkPrompt: "Don't have an account?",
    linkLabel: 'Sign up',
    linkHref: '/signup',
    emailLabel: 'Email',
    passwordLabel: 'Password',
  },
  signUp: {
    title: 'Sign up',
    submitLabel: 'Create account',
    linkPrompt: 'Already have an account?',
    linkLabel: 'Sign in',
    linkHref: '/signin',
    emailLabel: 'Email',
    passwordLabel: 'Password',
  },
  passwordPlaceholder: '* * * * * * * *',
} as const;
