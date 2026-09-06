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
  const originalClientId = process.env.COGNITO_CLIENT_ID;
  const originalClientSecret = process.env.COGNITO_CLIENT_SECRET;

  beforeEach(() => {
    process.env.COGNITO_CLIENT_ID = 'test-client-id';
    delete process.env.COGNITO_CLIENT_SECRET;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalClientId === undefined) delete process.env.COGNITO_CLIENT_ID;
    else process.env.COGNITO_CLIENT_ID = originalClientId;
    if (originalClientSecret === undefined) delete process.env.COGNITO_CLIENT_SECRET;
    else process.env.COGNITO_CLIENT_SECRET = originalClientSecret;
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
    const requestBody = JSON.parse(cognitoFetch.mock.calls[0][1].body);
    expect(requestBody).toEqual({
      ClientId: 'test-client-id',
      Username: 'user@example.com',
    });
    expect(requestBody).not.toHaveProperty('SecretHash');
  });

  it('sends the correct SecretHash when a client secret is configured', async () => {
    const clientSecret = 'test-client-secret';
    process.env.COGNITO_CLIENT_SECRET = clientSecret;
    const cognitoFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = cognitoFetch;

    await handler(
      { method: 'POST', body: { email: ' USER@example.com ' } } as never,
      createResponse() as never,
    );

    const requestBody = JSON.parse(cognitoFetch.mock.calls[0][1].body);
    expect(requestBody).toEqual({
      ClientId: 'test-client-id',
      Username: 'user@example.com',
      SecretHash: 'JDFaz1Kl3Xp5KDXMm53WxP0U+ngLmtk3FN01nVGOnmQ=',
    });
  });

  it('does not expose a raw Cognito error message', async () => {
    const rawMessage = 'User does not exist in the user pool';
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ 'x-amzn-requestid': 'request-id-123' }),
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
    expect(errorLog).toHaveBeenCalledWith(
      'ResendConfirmationCode failed: status=400 errorType=UserNotFoundException requestId=request-id-123 email=m***@example.com',
    );
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(rawMessage);
  });

  it('does not expose a client secret, SecretHash, or raw authorization error', async () => {
    const clientSecret = 'never-expose-this-secret';
    process.env.COGNITO_CLIENT_SECRET = clientSecret;
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers(),
      json: jest.fn().mockResolvedValue({
        __type: 'NotAuthorizedException',
        message: 'Client is configured with secret but SECRET_HASH was not received',
      }),
    });
    const response = createResponse();

    await handler(
      { method: 'POST', body: { email: 'user@example.com' } } as never,
      response as never,
    );

    const responseText = JSON.stringify(response.body);
    const logText = JSON.stringify(errorLog.mock.calls);
    expect(response.body).toEqual({
      message: '確認コードを再送できませんでした。入力内容をご確認ください。',
    });
    expect(responseText).not.toContain('SECRET_HASH');
    expect(responseText).not.toContain(clientSecret);
    expect(logText).not.toContain('SECRET_HASH');
    expect(logText).not.toContain(clientSecret);
  });
});
