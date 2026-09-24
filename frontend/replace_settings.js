const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/settings/page.tsx', 'utf8');

c = c.replace(
  '    email: "",\r\n    employee_id: "",',
  '    email: "",\r\n    phone: "",\r\n    employee_id: "",'
);
c = c.replace(
  '    email: "",\n    employee_id: "",',
  '    email: "",\n    phone: "",\n    employee_id: "",'
);

c = c.replace(
  '            email: profile.email || "",\r\n            employee_id: profile.employee_id || "",',
  '            email: profile.email || "",\r\n            phone: profile.phone || "",\r\n            employee_id: profile.employee_id || "",'
);
c = c.replace(
  '            email: profile.email || "",\n            employee_id: profile.employee_id || "",',
  '            email: profile.email || "",\n            phone: profile.phone || "",\n            employee_id: profile.employee_id || "",'
);

c = c.replace(
  '        employee_id: formData.employee_id,\r\n        department_id: formData.department_id ? Number(formData.department_id) : null,',
  '        employee_id: formData.employee_id,\r\n        phone: formData.phone,\r\n        department_id: formData.department_id ? Number(formData.department_id) : null,'
);
c = c.replace(
  '        employee_id: formData.employee_id,\n        department_id: formData.department_id ? Number(formData.department_id) : null,',
  '        employee_id: formData.employee_id,\n        phone: formData.phone,\n        department_id: formData.department_id ? Number(formData.department_id) : null,'
);

const emailField = '            <div>\\r?\\n              <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-xs text-slate-400 font-normal ml-2">\\(Managed by Maple Learning Solutions\\)</span></label>\\r?\\n              <input type="email" value={formData.email} disabled className="w-full px-4 py-2 rounded-md border border-hairline bg-slate-100 text-slate-500 cursor-not-allowed" />\\r?\\n            </div>';
const phoneField = '            <div>\n              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>\n              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-md border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-brand-green" />\n            </div>';
const regex = new RegExp(emailField, 'g');

c = c.replace(
  regex,
  `            <div>\n              <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-xs text-slate-400 font-normal ml-2">(Managed by Maple Learning Solutions)</span></label>\n              <input type="email" value={formData.email} disabled className="w-full px-4 py-2 rounded-md border border-hairline bg-slate-100 text-slate-500 cursor-not-allowed" />\n            </div>\n${phoneField}`
);

fs.writeFileSync('app/(dashboard)/settings/page.tsx', c);
console.log("updated settings page");
