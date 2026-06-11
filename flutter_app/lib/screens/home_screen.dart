import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import 'add_expense_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _expenses = [];
  List<dynamic> _summary = [];
  bool _loading = true;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final expenses = await ApiService.getExpenses();
      final summary = await ApiService.getSummary();
      setState(() { _expenses = expenses; _summary = summary; });
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      setState(() => _loading = false);
    }
  }

  double get _total => _expenses.fold(0, (sum, e) => sum + (e['amount'] as num).toDouble());

  final Map<String, String> _categoryIcons = {
    'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️',
    'Bills': '📄', 'Health': '💊', 'Entertainment': '🎬',
    'Education': '📚', 'Other': '📌',
  };

  Future<void> _logout() async {
    await ApiService.clearToken();
    if (mounted) {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Row(
          children: [
            Text('💰 ', style: TextStyle(fontSize: 20)),
            Text('SpendWise', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF2563EB))),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Color(0xFF64748B)),
            onPressed: _logout,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xFFE2E8F0)),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Total card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Total Spent This Month', style: TextStyle(color: Colors.white70, fontSize: 13)),
                          const SizedBox(height: 8),
                          Text(
                            '₹${NumberFormat('#,##,###').format(_total)}',
                            style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Text('${_expenses.length} transactions', style: const TextStyle(color: Colors.white60, fontSize: 13)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Category summary
                    if (_summary.isNotEmpty) ...[
                      const Text('By Category', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 100,
                        child: ListView.separated(
                          scrollDirection: Axis.horizontal,
                          itemCount: _summary.length,
                          separatorBuilder: (_, __) => const SizedBox(width: 10),
                          itemBuilder: (_, i) {
                            final s = _summary[i];
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(_categoryIcons[s['_id']] ?? '📌', style: const TextStyle(fontSize: 24)),
                                  const SizedBox(height: 4),
                                  Text(s['_id'], style: const TextStyle(fontSize: 11, color: Color(0xFF64748B))),
                                  Text('₹${NumberFormat('#,##,###').format(s['total'])}',
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],

                    // Expense list
                    const Text('Recent Transactions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
                    const SizedBox(height: 12),
                    if (_expenses.isEmpty)
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(40),
                          child: Column(
                            children: [
                              const Text('💸', style: TextStyle(fontSize: 48)),
                              const SizedBox(height: 12),
                              const Text('No expenses yet', style: TextStyle(color: Color(0xFF94A3B8))),
                              const SizedBox(height: 4),
                              const Text('Tap + to add your first one', style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13)),
                            ],
                          ),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _expenses.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) {
                          final exp = _expenses[i];
                          return Dismissible(
                            key: Key(exp['_id']),
                            direction: DismissDirection.endToStart,
                            background: Container(
                              alignment: Alignment.centerRight,
                              padding: const EdgeInsets.only(right: 20),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF2F2),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(Icons.delete_outline, color: Color(0xFFEF4444)),
                            ),
                            onDismissed: (_) async {
                              await ApiService.deleteExpense(exp['_id']);
                              _loadData();
                            },
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF0F4FF),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Center(child: Text(_categoryIcons[exp['category']] ?? '📌', style: const TextStyle(fontSize: 20))),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(exp['title'], style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14, color: Color(0xFF1E293B))),
                                        Text(
                                          '${exp['category']} · ${DateFormat('d MMM').format(DateTime.parse(exp['date']))}',
                                          style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    '−₹${NumberFormat('#,##,###').format(exp['amount'])}',
                                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: Color(0xFFEF4444)),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => const AddExpenseScreen()));
          if (result == true) _loadData();
        },
        backgroundColor: const Color(0xFF2563EB),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
