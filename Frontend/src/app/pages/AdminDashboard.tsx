import React, { useState } from "react";
import { 
  Settings, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck, 
  ArrowRight,
  GitMerge,
  GitPullRequest
} from "lucide-react";
import { mockRules } from "../mockData";

export function AdminDashboard() {
  const [rules, setRules] = useState(mockRules);
  const [activeTab, setActiveTab] = useState("rules");

  const [newRule, setNewRule] = useState<{
    id: string;
    description: string;
    isManagerApprover: boolean;
    managerOverrideId: string;
    flowType: string;
    minApprovalPercentage: number;
    approvers: { id: string; approverId: string; isRequired: boolean; sequenceOrder: number }[];
  }>({
    id: `RULE-${Math.floor(Math.random() * 1000)}`,
    description: "",
    isManagerApprover: true,
    managerOverrideId: "",
    flowType: "SEQUENTIAL",
    minApprovalPercentage: 100,
    approvers: []
  });

  const handleAddApprover = () => {
    setNewRule({
      ...newRule,
      approvers: [
        ...newRule.approvers,
        { id: `APP-${Math.floor(Math.random() * 1000)}`, approverId: "", isRequired: true, sequenceOrder: newRule.approvers.length + 1 }
      ]
    });
  };

  const updateApprover = (index: number, field: string, value: any) => {
    const updated = [...newRule.approvers];
    updated[index] = { ...updated[index], [field]: value };
    setNewRule({ ...newRule, approvers: updated });
  };

  const removeApprover = (index: number) => {
    const updated = newRule.approvers.filter((_, i) => i !== index);
    setNewRule({ ...newRule, approvers: updated });
  };

  const handleSaveRule = () => {
    if (!newRule.description) return;
    setRules([...rules, newRule]);
    // Reset form
    setNewRule({
      id: `RULE-${Math.floor(Math.random() * 1000)}`,
      description: "",
      isManagerApprover: true,
      managerOverrideId: "",
      flowType: "SEQUENTIAL",
      minApprovalPercentage: 100,
      approvers: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" /> Admin Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Configure approval routing rules and organizational settings</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'rules' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('rules')}
        >
          Routing Rules
          {activeTab === 'rules' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
        </button>
        <button
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('settings')}
        >
          Global Settings
          {activeTab === 'settings' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
        </button>
      </div>

      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to Create Rule */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-indigo-500" /> Create New Rule
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Rule Description</label>
                <input
                  type="text"
                  placeholder="e.g. Travel Expenses > $500"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newRule.description}
                  onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block">Manager First</label>
                  <span className="text-xs text-slate-500">Route to direct manager before custom approvers</span>
                </div>
                <div 
                  className={`w-11 h-6 rounded-full cursor-pointer flex items-center px-1 transition-colors ${newRule.isManagerApprover ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  onClick={() => setNewRule({ ...newRule, isManagerApprover: !newRule.isManagerApprover })}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${newRule.isManagerApprover ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Manager Override ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CEO_USER_ID"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newRule.managerOverrideId || ''}
                  onChange={e => setNewRule({ ...newRule, managerOverrideId: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Flow Type</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      className={`flex-1 flex items-center justify-center py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${newRule.flowType === 'SEQUENTIAL' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
                      onClick={() => setNewRule({...newRule, flowType: 'SEQUENTIAL'})}
                    >
                      <GitPullRequest className="w-3 h-3 mr-1" /> Seq
                    </button>
                    <button 
                      className={`flex-1 flex items-center justify-center py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${newRule.flowType === 'PARALLEL' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
                      onClick={() => setNewRule({...newRule, flowType: 'PARALLEL'})}
                    >
                      <GitMerge className="w-3 h-3 mr-1" /> Par
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Min Approval %</label>
                  <div className="relative">
                    <input
                      type="number"
                      max="100"
                      min="1"
                      className="w-full rounded-xl border border-slate-200 pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newRule.minApprovalPercentage}
                      onChange={e => setNewRule({ ...newRule, minApprovalPercentage: Number(e.target.value) })}
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">Custom Approvers</label>
                  <button 
                    onClick={handleAddApprover}
                    className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </button>
                </div>
                
                {newRule.approvers.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm">
                    No custom approvers added.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newRule.approvers.map((approver, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm relative group">
                        <button 
                          onClick={() => removeApprover(index)}
                          className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        
                        <input
                          type="text"
                          placeholder="Approver Name/Role"
                          className="w-full text-sm border-b border-slate-200 mb-2 pb-1 focus:outline-none-none focus:border-indigo-500 bg-transparent"
                          value={approver.approverId}
                          onChange={e => updateApprover(index, 'approverId', e.target.value)}
                        />
                        <div className="flex items-center justify-between text-xs mt-2">
                          <label className="flex items-center text-slate-600 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="mr-1.5 rounded text-indigo-600 focus:ring-indigo-500" 
                              checked={approver.isRequired}
                              onChange={e => updateApprover(index, 'isRequired', e.target.checked)}
                            />
                            Required
                          </label>
                          {newRule.flowType === 'SEQUENTIAL' && (
                            <div className="flex items-center text-slate-500">
                              Order: 
                              <input 
                                type="number" 
                                className="w-10 ml-1 border border-slate-200 rounded px-1 py-0.5 text-center" 
                                value={approver.sequenceOrder}
                                onChange={e => updateApprover(index, 'sequenceOrder', Number(e.target.value))}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-2">
                <button
                  onClick={handleSaveRule}
                  disabled={!newRule.description}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Rule
                </button>
              </div>
            </div>
          </div>

          {/* List of existing rules */}
          <div className="lg:col-span-2 space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center">
                      {rule.description}
                    </h3>
                    <div className="flex items-center text-sm text-slate-500 mt-1 gap-3">
                      <span className="flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {rule.flowType === 'SEQUENTIAL' ? <GitPullRequest className="w-3 h-3 mr-1" /> : <GitMerge className="w-3 h-3 mr-1" />}
                        {rule.flowType}
                      </span>
                      <span>Min {rule.minApprovalPercentage}% Approval</span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-400">{rule.id}</div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Flow:</span>
                    
                    {rule.isManagerApprover && (
                      <>
                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-100 flex items-center shadow-sm">
                          <ShieldCheck className="w-4 h-4 mr-1.5" /> Direct Manager
                        </div>
                        {rule.approvers.length > 0 && <ArrowRight className="w-4 h-4 text-slate-300" />}
                      </>
                    )}

                    {rule.approvers.map((app, idx) => (
                      <React.Fragment key={app.id}>
                        {idx > 0 && rule.flowType === 'SEQUENTIAL' && <ArrowRight className="w-4 h-4 text-slate-300" />}
                        {idx > 0 && rule.flowType === 'PARALLEL' && <Plus className="w-4 h-4 text-slate-300" />}
                        
                        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium border shadow-sm flex items-center ${app.isRequired ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {app.approverId} {app.isRequired && <span className="ml-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" title="Required Approver"></span>}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-500 py-12">
          Global organizational settings and logic overrides will be placed here.
        </div>
      )}
    </div>
  );
}
