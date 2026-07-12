<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Exceptions\BusinessRuleException;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {
    }

    /**
     * Login user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $data = $this->authService->login($request->validated());

            return response()->json([
                'success' => true,
                'status' => 200,
                'message' => 'Login successful.',
                'token' => $data['token'],
                'user' => new UserResource($data['user']),
            ]);
        } catch (BusinessRuleException $exception) {

            return response()->json([
                'success' => false,
                'status' => 401,
                'message' => $exception->getMessage(),
            ],401);

        } catch (Throwable) {

            return response()->json([
                'success' => false,
                'status' => 500,
                'message' => 'Unable to login.',
            ],500);
        }
    }

    /**
     * Authenticated user.
     */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    /**
     * Logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'status' => 200,
            'message' => 'Logged out successfully.',
        ]);
    }
}
