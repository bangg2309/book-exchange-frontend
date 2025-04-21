'use client';

import {useState, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import {FcGoogle} from 'react-icons/fc';
import {FaGithub, FaEye, FaEyeSlash, FaBook} from 'react-icons/fa';

interface LoginFormData {
    username: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Skip redirection if we're in the process of logging in
                if (isLoading) return;
                
                // Check if user is already authenticated
                if (authService.isAuthenticated()) {
                    console.log('User is already authenticated');
                    
                    // Get token but don't redirect if refresh fails
                    const newToken = await authService.refreshToken();
                    
                    // Force a fresh check for user info even if token refresh fails
                    const userInfo = await authService.getUserInfo();
                    if (userInfo) {
                        console.log('Login page - User info:', JSON.stringify(userInfo));
                        
                        // Determine if user is admin
                        const isAdmin = userInfo.roles?.some(
                            (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
                        );
                        console.log('Login page - User is admin:', isAdmin);
                        
                        // Store admin status in localStorage to trigger update in Header
                        localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
                        
                        // Dispatch event to update components
                        window.dispatchEvent(new Event('auth-changed'));
                        
                        // Redirect to appropriate path after a short delay
                        setTimeout(() => {
                            if (isAdmin) {
                                console.log('Login page - Redirecting admin to /admin');
                                router.push('/admin');
                            } else {
                                console.log('Login page - Redirecting user to /profile');
                                router.push('/profile');
                            }
                        }, 100);
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
                // Don't set any error message - just let them stay on login page
            }
        };
        
        checkAuth();
    }, [router, isLoading]);

    const {
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginFormData>({});

    const onSubmit = async (data: LoginFormData) => {
        try {
            setIsLoading(true);

            // Perform login
            const authResponse = await authService.login({
                username: data.username,
                password: data.password,
            });

            console.log('Login successful');
            
            // Check user data from the response
            if (authResponse.userInfo) {
                console.log('User info from login response:', JSON.stringify(authResponse.userInfo));
                
                // Check admin status directly from login response
                const hasAdminRole = authResponse.userInfo.roles?.some(
                    (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
                );
                
                console.log('User has admin role:', hasAdminRole);
                
                // Store admin status
                localStorage.setItem('isAdmin', hasAdminRole ? 'true' : 'false');
                
                // Setup token refresh in the background
                setTimeout(() => {
                    authService.setupTokenRefresh();
                }, 1000);
                
                // Redirect with short delay to allow UI to update
                setTimeout(() => {
                    if (hasAdminRole) {
                        console.log('Redirecting admin user to /admin');
                        router.push('/admin');
                    } else {
                        console.log('Redirecting regular user to /profile');
                        router.push('/profile');
                    }
                }, 200);
            } else {
                // Fallback to getting user info from API
                console.log('No user info in login response, fetching from API');
                const userInfo = await authService.getUserInfo();
                
                if (userInfo) {
                    // Check admin role
                    const isAdmin = userInfo.roles?.some(
                        (role: any) => role && role.name && role.name.toUpperCase() === 'ADMIN'
                    );
                    
                    // Redirect based on role
                    if (isAdmin) {
                        console.log('Redirecting admin user to /admin (after API check)');
                        router.push('/admin');
                    } else {
                        console.log('Redirecting regular user to /profile (after API check)');
                        router.push('/profile');
                    }
                } else {
                    // If we can't determine role, redirect to profile
                    console.log('Could not determine user role, redirecting to profile');
                    router.push('/profile');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            // Toast is shown by authService.login already
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        try {
            setIsLoading(true);
            
            // Call social login method which will show toast if there's an error
            await authService.socialLogin(provider);
            
            // For demo purposes right now, simulate a successful social login
            // Force a fresh check for user info
            await authService.getUserInfo();
            
            // Determine if user is admin
            const isAdmin = authService.isAdmin();
            console.log('Social login - User is admin:', isAdmin);
            
            // Set up token refresh
            authService.setupTokenRefresh();
            
            // Store authentication state in localStorage to trigger storage event
            localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
            
            // Also dispatch a custom event for components in the same window
            window.dispatchEvent(new Event('auth-changed'));
            
            // Delay redirect slightly to allow header to update
            setTimeout(() => {
                // Redirect based on role
                if (isAdmin) {
                    console.log('Social login - Redirecting admin user to /admin');
                    router.push('/admin');
                } else {
                    console.log('Social login - Redirecting regular user to /profile');
                    router.push('/profile');
                }
            }, 100);
        } catch (err: any) {
            console.error('Social login error:', err);
            // Toast is shown by authService.socialLogin already
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Banner */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-600 to-green-800">
                <div className="absolute inset-0 bg-black/20"/>
                <div className="relative flex flex-col justify-center px-12 text-white z-10">
                    <h1 className="text-5xl font-bold mb-6">Chào Mừng Trở Lại!</h1>
                    <p className="text-xl mb-8 text-white/90">Đăng nhập để tiếp tục hành trình trao đổi sách với cộng đồng.</p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h3 className="font-semibold text-lg mb-3">Mua & Bán Sách</h3>
                            <p className="text-white/80">Kết nối với những người yêu sách, tiết kiệm chi phí và bảo vệ môi trường.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h3 className="font-semibold text-lg mb-3">Cộng Đồng</h3>
                            <p className="text-white/80">Tham gia thảo luận và kết nối với cộng đồng sinh viên yêu sách.</p>
                        </div>
                    </div>
                </div>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}/>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo and Title */}
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center">
                                <FaBook className="w-8 h-8 text-white"/>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Đăng nhập tài khoản
                        </h2>
                        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                            Chào mừng trở lại! Vui lòng nhập thông tin đăng nhập
                        </p>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200
                                dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50
                                dark:hover:bg-gray-800 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            <FcGoogle className="w-6 h-6"/>
                            Tiếp tục với Google
                        </button>
                        <button
                            onClick={() => handleSocialLogin('github')}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200
                                dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50
                                dark:hover:bg-gray-800 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            <FaGithub className="w-6 h-6"/>
                            Tiếp tục với GitHub
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 text-base">
                                    hoặc tiếp tục với tên đăng nhập
                                </span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="username"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tên đăng nhập
                                </label>
                                <input
                                    {...register('username', {
                                        required: 'Vui lòng nhập tên đăng nhập',
                                        minLength: {
                                            value: 3,
                                            message: 'Tên đăng nhập phải có ít nhất 3 ký tự',
                                        },
                                    })}
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    className={`appearance-none block w-full px-4 py-3 border-2 ${
                                        errors.username ? 'border-red-300' : 'border-gray-200'
                                    } dark:border-gray-700 rounded-xl placeholder-gray-400 dark:placeholder-gray-500
                                        text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500
                                        focus:border-transparent dark:bg-gray-800 text-base transition-all`}
                                    placeholder="tên đăng nhập"
                                />
                                {errors.username && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password"
                                       className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('password', {
                                            required: 'Vui lòng nhập mật khẩu',
                                        })}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        className={`appearance-none block w-full px-4 py-3 border-2 ${
                                            errors.password ? 'border-red-300' : 'border-gray-200'
                                        } dark:border-gray-700 rounded-xl placeholder-gray-400 dark:placeholder-gray-500
                                            text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500
                                            focus:border-transparent dark:bg-gray-800 text-base transition-all`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
                                            dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="w-5 h-5"/>
                                        ) : (
                                            <FaEye className="w-5 h-5"/>
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-5 w-5 text-green-600 focus:ring-green-500 border-2 border-gray-200
                                        dark:border-gray-700 rounded dark:bg-gray-800 transition-colors"
                                />
                                <label htmlFor="remember-me"
                                       className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            <div>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-green-700 hover:text-green-600 dark:text-green-400"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent
                                    text-base font-medium rounded-xl text-white bg-green-700 hover:bg-green-800
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading && (
                                    <span className="absolute left-4 inset-y-0 flex items-center">
                                            <svg
                                                className="animate-spin h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        </span>
                                )}
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-base text-gray-600 dark:text-gray-400">
                        Chưa có tài khoản?{' '}
                        <Link href="/register"
                              className="font-medium text-green-700 hover:text-green-600 dark:text-green-400">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}