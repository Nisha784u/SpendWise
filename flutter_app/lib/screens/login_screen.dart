import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String _error = '';
  bool _isLogin = true;
  final _nameCtrl = TextEditingController();

  Future<void> _submit() async {
    setState(() { _loading = true; _error = ''; });
    try {
      final data = _isLogin
          ? await ApiService.login(_emailCtrl.text.trim(), _passwordCtrl.text)
          : await ApiService.register(_nameCtrl.text.trim(), _emailCtrl.text.trim(), _passwordCtrl.text);

      if (data['token'] != null) {
        await ApiService.saveToken(data['token']);
        if (mounted) {
          Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const HomeScreen()));
        }
      } else {
        setState(() { _error = data['message'] ?? 'Something went wrong'; });
      }
    } catch (e) {
      setState(() { _error = 'Connection error. Check your network.'; });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4FF),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 60),
              const Text('💰', style: TextStyle(fontSize: 56)),
              const SizedBox(height: 16),
              Text(
                _isLogin ? 'Welcome Back' : 'Create Account',
                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
              ),
              const SizedBox(height: 8),
              Text(
                _isLogin ? 'Sign in to SpendWise' : 'Track your spending smartly',
                style: const TextStyle(fontSize: 14, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 40),

              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    if (!_isLogin) ...[
                      _buildField(_nameCtrl, 'Full Name', Icons.person_outline),
                      const SizedBox(height: 16),
                    ],
                    _buildField(_emailCtrl, 'Email', Icons.email_outlined, keyboardType: TextInputType.emailAddress),
                    const SizedBox(height: 16),
                    _buildField(_passwordCtrl, 'Password', Icons.lock_outline, obscure: true),
                    if (_error.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(_error, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 13)),
                      ),
                    ],
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _loading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: _loading
                            ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                            : Text(_isLogin ? 'Sign In' : 'Create Account', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: () => setState(() { _isLogin = !_isLogin; _error = ''; }),
                child: Text(
                  _isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in',
                  style: const TextStyle(color: Color(0xFF2563EB)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildField(TextEditingController ctrl, String label, IconData icon,
      {bool obscure = false, TextInputType? keyboardType}) {
    return TextField(
      controller: ctrl,
      obscureText: obscure,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF2563EB), width: 2)),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
      ),
    );
  }
}
