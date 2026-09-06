import handler from '../pages/api/auth/resend-confirmation';

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, unknown>,
    status: jest.fn((statusCode: number) => {
      response.statusCode = statusCode;
      return response;
    }),
    json: jest.fn((body: unknown) => {
      response.body = body;
      return response;
    }),
    setHeader: jest.fn((name: string, value: unknown) => {
      response.headers[name] = value;
    }),
  };
  return response;
};

describe('confirmation code resend API', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('does not call Cognito when the email address is empty', async () => {
    const cognitoFetch = jest.fn();
    global.fetch = cognitoFetch;
    const response = createResponse();

    await handler({ method: 'POST', body: { email: '  ' } } as never, response as never);

    expect(response.statusCode).toBe(400);
    expect(cognitoFetch).not.toHaveBeenCalled();
  });

  it('calls ResendConfirmationCode once and returns the success message', async () => {
    const cognitoFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = cognitoFetch;
    const response = createResponse();

    await handler(
      { method: 'POST', body: { email: ' USER@example.com ' } } as never,
      response as never,
    );

    expect(cognitoFetch).toHaveBeenCalledTimes(1);
    expect(cognitoFetch).toHaveBeenCalledWith(
      expect.stringContaining('cognito-idp.ap-northeast-1.amazonaws.com'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.ResendConfirmationCode',
        }),
        body: expect.stringContaining('user@example.com'),
      }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: '確認コードを再送しました。メールをご確認ください。',
    });
  });

  it('does not expose a raw Cognito error message', async () => {
    const rawMessage = 'User does not exist in the user pool';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        __type: 'UserNotFoundException',
        message: rawMessage,
      }),
    });
    const response = createResponse();

    await handler(
      { method: 'POST', body: { email: 'missing@example.com' } } as never,
      response as never,
    );

    expect(response.statusCode).toBe(400);
    expect(JSON.stringify(response.body)).not.toContain(rawMessage);
    expect(response.body).toEqual({
      message:
        '入力されたメールアドレスの登録状況を確認できませんでした。入力内容をご確認ください。',
    });
  });
});
