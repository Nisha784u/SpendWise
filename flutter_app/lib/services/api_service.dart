import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Change this to your deployed backend URL
  static const String baseUrl = 'http://10.0.2.2:5000/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<Map<String, String>> _headers() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> register(String name, String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'email': email, 'password': password}),
    );
    return jsonDecode(res.body);
  }

  static Future<List<dynamic>> getExpenses({int? month, int? year}) async {
    final headers = await _headers();
    final query = 'month=${month ?? DateTime.now().month}&year=${year ?? DateTime.now().year}';
    final res = await http.get(Uri.parse('$baseUrl/expenses?$query'), headers: headers);
    return jsonDecode(res.body);
  }

  static Future<Map<String, dynamic>> addExpense(Map<String, dynamic> data) async {
    final headers = await _headers();
    final res = await http.post(
      Uri.parse('$baseUrl/expenses'),
      headers: headers,
      body: jsonEncode(data),
    );
    return jsonDecode(res.body);
  }

  static Future<void> deleteExpense(String id) async {
    final headers = await _headers();
    await http.delete(Uri.parse('$baseUrl/expenses/$id'), headers: headers);
  }

  static Future<List<dynamic>> getSummary({int? month, int? year}) async {
    final headers = await _headers();
    final query = 'month=${month ?? DateTime.now().month}&year=${year ?? DateTime.now().year}';
    final res = await http.get(Uri.parse('$baseUrl/expenses/summary?$query'), headers: headers);
    return jsonDecode(res.body);
  }
}
