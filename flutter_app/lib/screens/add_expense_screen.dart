import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class AddExpenseScreen extends StatefulWidget {
  const AddExpenseScreen({super.key});

  @override
  State<AddExpenseScreen> createState() => _AddExpenseScreenState();
}

class _AddExpenseScreenState extends State<AddExpenseScreen> {
  final _titleCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _noteCtrl = TextEditingController();
  String _category = 'Food';
  DateTime _date = DateTime.now();
  bool _loading = false;
  String _error = '';

  static const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Education', 'Other'];
  final Map<String, String> _icons = {
    'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️',
    'Bills': '📄', 'Health': '💊', 'Entertainment': '🎬',
    'Education': '📚', 'Other': '📌',
  };

  Future<void> _submit() async {
    if (_titleCtrl.text.isEmpty || _amountCtrl.text.isEmpty) {
      setState(() => _error = 'Title and amount are required');
      return;
    }
    setState(() { _loading = true; _error = ''; });
    try {
      await ApiService.addExpense({
        'title': _titleCtrl.text.trim(),
        'amount': double.parse(_amountCtrl.text),
        'category': _category,
        'date': _date.toIso8601String(),
        'note': _noteCtrl.text.trim(),
      });
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      setState(() { _error = 'Failed to add expense'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('Add Expense', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18, color: Color(0xFF1E293B))),
        leading: IconButton(
          icon: const Icon(Icons.close, color: Color(0xFF64748B)),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xFFE2E8F0)),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildCard(children: [
              _buildField(_titleCtrl, 'Title', 'e.g. Lunch at Dominos', Icons.edit_outlined),
              const SizedBox(height: 16),
              _buildField(_amountCtrl, 'Amount (₹)', '0', Icons.currency_rupee, keyboardType: TextInputType.number),
            ]),
            const SizedBox(height: 16),
            _buildCard(children: [
              const Text('Category', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF64748B))),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: categories.map((cat) {
                  final selected = cat == _category;
                  return GestureDetector(
                    onTap: () => setState(() => _category = cat),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected ? const Color(0xFF2563EB) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${_icons[cat]} $cat',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: selected ? Colors.white : const Color(0xFF475569),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ]),
            const SizedBox(height: 16),
            _buildCard(children: [
              const Text('Date', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Color(0xFF64748B))),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _date,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) setState(() => _date = picked);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 18, color: Color(0xFF64748B)),
                      const SizedBox(width: 10),
                      Text(DateFormat('d MMMM yyyy').format(_date), style: const TextStyle(fontSize: 14, color: Color(0xFF1E293B))),
                    ],
                  ),
                ),
              ),
            ]),
            const SizedBox(height: 16),
            _buildCard(children: [
              _buildField(_noteCtrl, 'Note (optional)', 'Any additional details...', Icons.note_outlined),
            ]),
            if (_error.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10)),
                child: Text(_error, style: const TextStyle(color: Color(0xFFEF4444), fontSize: 13)),
              ),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                    : const Text('Add Expense', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({required List<Widget> children}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
    );
  }

  Widget _buildField(TextEditingController ctrl, String label, String hint, IconData icon,
      {TextInputType? keyboardType}) {
    return TextField(
      controller: ctrl,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
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
