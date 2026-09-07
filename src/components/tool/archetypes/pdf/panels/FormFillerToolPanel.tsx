import React, { useState } from 'react';
import { FormInput, Check, Plus, Trash2, Sliders, Lock, CheckSquare, ListFilter, FileText } from 'lucide-react';
import { ExtractedFormField } from '../../../../../core/pdf-engine/PdfEngine';

interface FormFillerToolPanelProps {
  formFieldValues: Record<string, any>;
  setFormFieldValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  detectedFields?: ExtractedFormField[];
  flattenForm: boolean;
  setFlattenForm: (flatten: boolean) => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const FormFillerToolPanel: React.FC<FormFillerToolPanelProps> = ({
  formFieldValues,
  setFormFieldValues,
  detectedFields = [],
  flattenForm,
  setFlattenForm,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const [customKey, setCustomKey] = useState('');
  const [customVal, setCustomVal] = useState('');

  const handleAddCustomField = () => {
    if (!customKey.trim()) return;
    setFormFieldValues((prev) => ({
      ...prev,
      [customKey.trim()]: customVal,
    }));
    setCustomKey('');
    setCustomVal('');
  };

  const handleRemoveField = (key: string) => {
    setFormFieldValues((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const hasDetectedFields = detectedFields && detectedFields.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FormInput className="w-4 h-4 text-red-500" />
            PDF Form Filler & AcroForm Editor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Populate text fields, checkboxes, and dates with optional read-only security flattening.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            isAdvancedMode
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {isAdvancedMode ? 'Advanced Pro Mode' : 'Standard Mode'}
        </button>
      </div>

      {/* Detected Document Form Fields */}
      {hasDetectedFields && (
        <div className="space-y-3 p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              Detected Interactive Document Form Fields ({detectedFields.length})
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 rounded-full">
              AcroForm Active
            </span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {detectedFields.map((field) => {
              const curVal = formFieldValues[field.name] !== undefined ? formFieldValues[field.name] : field.value;

              if (field.type === 'checkbox') {
                const isChecked = curVal === true || curVal === 'true' || curVal === 'checked' || curVal === '1';
                return (
                  <div
                    key={field.name}
                    onClick={() =>
                      setFormFieldValues({
                        ...formFieldValues,
                        [field.name]: !isChecked,
                      })
                    }
                    className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-red-300"
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 font-mono">{field.name}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                        isChecked ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              }

              if (field.type === 'dropdown' && field.options && field.options.length > 0) {
                return (
                  <div key={field.name} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      {field.name} (Select Dropdown)
                    </label>
                    <select
                      value={String(curVal || '')}
                      onChange={(e) => setFormFieldValues({ ...formFieldValues, [field.name]: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="">-- Choose Option --</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={field.name} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {field.name}
                  </label>
                  <input
                    type="text"
                    value={String(curVal || '')}
                    onChange={(e) => setFormFieldValues({ ...formFieldValues, [field.name]: e.target.value })}
                    placeholder={`Enter value for ${field.name}`}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Form Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name (Text Field)
            </label>
            <input
              type="text"
              value={formFieldValues.fullName || ''}
              onChange={(e) => setFormFieldValues({ ...formFieldValues, fullName: e.target.value })}
              placeholder="e.g. Alexander Hamilton"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Email Field)
            </label>
            <input
              type="email"
              value={formFieldValues.email || ''}
              onChange={(e) => setFormFieldValues({ ...formFieldValues, email: e.target.value })}
              placeholder="e.g. alex@example.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone / Contact (Tel Field)
            </label>
            <input
              type="tel"
              value={formFieldValues.phone || ''}
              onChange={(e) => setFormFieldValues({ ...formFieldValues, phone: e.target.value })}
              placeholder="e.g. +1 (555) 019-2834"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date (Date Field)
            </label>
            <input
              type="date"
              value={formFieldValues.date || ''}
              onChange={(e) => setFormFieldValues({ ...formFieldValues, date: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Custom Form Fields (Advanced) */}
        {isAdvancedMode && (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Custom AcroForm Field Values
            </h4>

            {Object.entries(formFieldValues)
              .filter(([k]) => !['fullName', 'email', 'phone', 'date'].includes(k))
              .map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-1/3 px-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono truncate">
                    {key}
                  </span>
                  <input
                    type="text"
                    value={typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val || '')}
                    onChange={(e) => setFormFieldValues({ ...formFieldValues, [key]: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveField(key)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

            {/* Add Field Row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Field Name (e.g. Address)"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                className="w-1/3 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
              <input
                type="text"
                placeholder="Field Value"
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        )}

        {/* Flatten Form Toggle */}
        <div
          onClick={() => setFlattenForm(!flattenForm)}
          className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            flattenForm
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Flatten Form on Export (Read-Only Security)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Bakes all filled fields permanently into page graphics so entries cannot be altered.
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border ${
              flattenForm ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {flattenForm && <Check className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>
    </div>
  );
};
