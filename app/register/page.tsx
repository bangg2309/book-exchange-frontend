'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaEye, FaEyeSlash, FaBook } from 'react-icons/fa';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        defaultValues: {
            acceptTerms: false
        }
    });

    const password = watch('password');

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsLoading(true);
            
            await authService.register({
                username: data.username,
                email: data.email,
                password: data.password
            });
            
            router.push('/login?registered=true');
        } catch (err: any) {
            console.error('Registration error:', err);
            // Toast is shown by authService.register already
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialRegister = async (provider: 'google' | 'github') => {
        try {
            setIsLoading(true);
            
            // Call social login method which will show toast if there's an error
            await authService.socialLogin(provider);
            
            router.push('/admin');
        } catch (err: any) {
            console.error('Social registration error:', err);
            // Toast is shown by authService.socialLogin already
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Banner */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-green-600 to-green-800">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative flex flex-col justify-center px-12 text-white z-10">
                    <h1 className="text-5xl font-bold mb-6">Tham Gia Cộng Đồng</h1>
                    <p className="text-xl mb-8 text-white/90">Tạo tài khoản và bắt đầu hành trình trao đổi sách cùng chúng tôi.</p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h3 className="font-semibold text-lg mb-3">Tiết Kiệm Chi Phí</h3>
                            <p className="text-white/80">Mua bán sách cũ với giá hợp lý giúp bạn tiết kiệm chi phí học tập.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                            <h3 className="font-semibold text-lg mb-3">Bảo Vệ Môi Trường</h3>
                            <p className="text-white/80">Tái sử dụng sách là cách đơn giản để góp phần bảo vệ môi trường.</p>
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

            {/* Right Side - Registration Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo and Title */}
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center">
                                <FaBook className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Tạo tài khoản mới
                        </h2>
                        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                            Tham gia cộng đồng và bắt đầu hành trình trao đổi sách
                        </p>
                    </div>

                    {/* Social Registration Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSocialRegister('google')}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 
                                bg-white border-2 border-gray-200 shadow-sm
                                dark:bg-gray-800 dark:border-gray-700 
                                rounded-xl text-gray-700 dark:text-gray-300 
                                hover:bg-gray-50 hover:shadow-md
                                dark:hover:bg-gray-700 transition-all font-medium"
                            disabled={isLoading}
                        >
                            <FcGoogle className="w-6 h-6" />
                            Tiếp tục với Google
                        </button>
                        <button
                            onClick={() => handleSocialRegister('github')}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 
                            dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 
                            dark:hover:bg-gray-800 transition-colors font-medium"
                            disabled={isLoading}
                        >
                            <FaGithub className="w-6 h-6" />
                            Tiếp tục với GitHub
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 text-base">
                                hoặc đăng ký với email
                            </span>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tên đăng nhập
                                </label>
                                <input
                                    {...register('username', {
                                        required: 'Vui lòng nhập tên đăng nhập',
                                        minLength: {
                                            value: 4,
                                            message: 'Tên đăng nhập phải có ít nhất 4 ký tự',
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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Địa chỉ email
                                </label>
                                <input
                                    {...register('email', {
                                        required: 'Vui lòng nhập email',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Email không hợp lệ',
                                        },
                                    })}
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    className={`appearance-none block w-full px-4 py-3 border-2 ${
                                        errors.email ? 'border-red-300' : 'border-gray-200'
                                    } dark:border-gray-700 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 
                                    text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 
                                    focus:border-transparent dark:bg-gray-800 text-base transition-all`}
                                    placeholder="name@company.com"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('password', {
                                            required: 'Vui lòng nhập mật khẩu',
                                            minLength: {
                                                value: 8,
                                                message: 'Mật khẩu phải có ít nhất 8 ký tự',
                                            },
                                    
                                        })}
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
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
                                            <FaEyeSlash className="w-5 h-5" />
                                        ) : (
                                            <FaEye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <input
                                        {...register('confirmPassword', {
                                            required: 'Vui lòng xác nhận mật khẩu',
                                            validate: value => value === password || 'Mật khẩu không khớp'
                                        })}
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        className={`appearance-none block w-full px-4 py-3 border-2 ${
                                            errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                                        } dark:border-gray-700 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 
                                        text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 
                                        focus:border-transparent dark:bg-gray-800 text-base transition-all`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
                                        dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <FaEyeSlash className="w-5 h-5" />
                                        ) : (
                                            <FaEye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                {...register('acceptTerms', {
                                    required: 'Bạn phải chấp nhận điều khoản và điều kiện'
                                })}
                                id="accept-terms"
                                type="checkbox"
                                className="h-5 w-5 text-green-600 focus:ring-green-500 border-2 border-gray-200 
                                dark:border-gray-700 rounded dark:bg-gray-800 transition-colors"
                            />
                            <label htmlFor="accept-terms" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                Tôi đồng ý với{' '}
                                <Link href="/terms" className="font-medium text-green-700 hover:text-green-600 dark:text-green-400">
                                    Điều khoản và Điều kiện
                                </Link>
                            </label>
                        </div>
                        {errors.acceptTerms && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                {errors.acceptTerms.message}
                            </p>
                        )}

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
                                {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-base text-gray-600 dark:text-gray-400">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="font-medium text-green-700 hover:text-green-600 dark:text-green-400">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
} 