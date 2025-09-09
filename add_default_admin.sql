-- إضافة المدير الافتراضي إلى قاعدة البيانات
-- اسم المستخدم: made beine
-- كلمة المرور: 27562254

-- إضافة المستخدم الافتراضي
INSERT INTO public.users (id, name, phone, role, password) VALUES
('ADMIN_DEFAULT', 'made beine', '+222 27562254', 'Admin', '27562254')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  password = EXCLUDED.password;

-- إضافة سجل عملية لإنشاء المدير
INSERT INTO public.operations_log (id, operation_type, details, date, performed_by) VALUES
('LOG_ADMIN_SETUP', 'إنشاء مدير افتراضي', 'تم إنشاء حساب المدير الافتراضي: made beine', NOW()::text, 'النظام التلقائي')
ON CONFLICT (id) DO NOTHING;

-- التحقق من إنشاء المستخدم
SELECT 'تم إنشاء المدير الافتراضي بنجاح!' as message, name, role FROM public.users WHERE id = 'ADMIN_DEFAULT';

