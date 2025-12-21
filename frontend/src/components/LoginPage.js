import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, GraduationCap, Users, BookOpen, Award, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    tenantId: ''
  });
  
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    role: 'admin',
    school_code: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginData.tenantId || loginData.tenantId.trim() === '') {
      toast.error('School CODE is required');
      return;
    }
    
    console.log('🔄 Login form submitted!', loginData);
    setLoading(true);
    
    try {
      console.log('🔄 Calling login function...');
      const result = await login(loginData.username, loginData.password, loginData.tenantId);
      console.log('✅ Login result:', result);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!registerData.school_code || registerData.school_code.trim() === '') {
      toast.error('School CODE is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register({...registerData, tenant_id: registerData.school_code});
      
      if (result.success) {
        toast.success('Registration successful! Please login.');
        // Switch to login tab after successful registration
        document.querySelector('[data-state="inactive"][value="login"]')?.click();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Language Toggle */}
        <div className="absolute top-0 right-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-gray-600 hover:text-gray-900"
          >
            <Globe className="h-4 w-4 mr-1" />
            {i18n.language === 'en' ? 'বাংলা' : 'English'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-emerald-500 p-3 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">School ERP</h1>
          <p className="text-gray-600 mt-2">{t('auth.loginTitle')}</p>
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
            <Users className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Student Management</p>
          </div>
          <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
            <BookOpen className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Academic Tracking</p>
          </div>
          <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20">
            <Award className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-xs text-gray-600 font-medium">Performance Reports</p>
          </div>
        </div>

        {/* Login/Register Form */}
        <Card className="glass-card border-0 shadow-2xl">
          <CardContent className="p-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  {t('auth.signIn')}
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                  {t('common.add')}
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('auth.username')}</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={t('auth.username')}
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('auth.password')}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                        className="form-input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenantId">School CODE <span className="text-red-500">*</span></Label>
                    <Input
                      id="tenantId"
                      type="text"
                      placeholder="School CODE"
                      value={loginData.tenantId}
                      onChange={(e) => setLoginData({...loginData, tenantId: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-modern bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-dots">{t('auth.signingIn')}</span>
                    ) : (
                      t('auth.signIn')
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={registerData.full_name}
                      onChange={(e) => setRegisterData({...registerData, full_name: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg_email">Email</Label>
                    <Input
                      id="reg_email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg_username">Username</Label>
                    <Input
                      id="reg_username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg_password">Password</Label>
                    <div className="relative">
                      <Input
                        id="reg_password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        required
                        className="form-input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg_school_code">School CODE <span className="text-red-500">*</span></Label>
                    <Input
                      id="reg_school_code"
                      type="text"
                      placeholder="Enter your school code"
                      value={registerData.school_code}
                      onChange={(e) => setRegisterData({...registerData, school_code: e.target.value})}
                      required
                      className="form-input"
                    />
                    <p className="text-xs text-gray-500">School CODE is provided by your institution (Settings → Institution)</p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-modern bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-dots">Creating account</span>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Comprehensive School Management System
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Multi-tenant • Role-based Access • Real-time Analytics
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;