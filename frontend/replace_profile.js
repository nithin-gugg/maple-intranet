const fs = require('fs');
let c = fs.readFileSync('app/(dashboard)/employees/page.tsx', 'utf8');

c = c.replace(
  'import { Search, Filter, Mail, Phone, MapPin, Briefcase } from "lucide-react";',
  'import { Search, Filter, Mail, Phone, MapPin, Briefcase, X, Calendar, Hash } from "lucide-react";'
);

c = c.replace(
  '<button className="text-brand-green-dark text-sm font-medium hover:underline">\r\n                View Full Profile\r\n              </button>',
  `<button onClick={() => setSelectedEmployee(employee)} className="text-brand-green-dark text-sm font-medium hover:underline">\r\n                View Full Profile\r\n              </button>`
);
// fallback for \n
c = c.replace(
  '<button className="text-brand-green-dark text-sm font-medium hover:underline">\n                View Full Profile\n              </button>',
  `<button onClick={() => setSelectedEmployee(employee)} className="text-brand-green-dark text-sm font-medium hover:underline">\n                View Full Profile\n              </button>`
);

const modalStr = `      </div>

      {/* Profile Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <img
                  src={selectedEmployee.user?.profile_image_url || \`https://ui-avatars.com/api/?name=\${selectedEmployee.user?.first_name}+\${selectedEmployee.user?.last_name}&background=random\`}
                  alt={selectedEmployee.user?.first_name}
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-sm"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedEmployee.user?.first_name} {selectedEmployee.user?.last_name}</h2>
                  <p className="text-brand-green-dark font-medium">{selectedEmployee.designation || "Employee"}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
                    <Briefcase className="h-4 w-4 text-brand-green" />
                    Work Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Employee ID</p>
                      <p className="text-slate-800 flex items-center gap-2 mt-1">
                        <Hash className="h-4 w-4 text-slate-400" />
                        {selectedEmployee.employee_id || "Not assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Department</p>
                      <p className="text-slate-800 flex items-center gap-2 mt-1">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        {selectedEmployee.department?.name || "No Department"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date of Joining</p>
                      <p className="text-slate-800 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {selectedEmployee.joining_date ? new Date(selectedEmployee.joining_date).toLocaleDateString() : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 border-b pb-2">
                    <Mail className="h-4 w-4 text-brand-green" />
                    Contact Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</p>
                      <p className="text-slate-800 flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {selectedEmployee.user?.email || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Phone</p>
                      <p className="text-slate-800 flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {selectedEmployee.phone || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Location</p>
                      <p className="text-slate-800 flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {selectedEmployee.location || "Headquarters"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedEmployee.bio && (
                <div>
                  <h3 className="font-semibold text-slate-900 border-b pb-2 mb-3">About</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">{selectedEmployee.bio}</p>
                </div>
              )}

              {selectedEmployee.skills && (
                <div>
                  <h3 className="font-semibold text-slate-900 border-b pb-2 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.split(',').map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md font-medium transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

c = c.replace(/      <\/div>\r?\n    <\/div>\r?\n  \);\r?\n}/g, modalStr + "\n}");

fs.writeFileSync('app/(dashboard)/employees/page.tsx', c);
console.log("Updated employees page");
