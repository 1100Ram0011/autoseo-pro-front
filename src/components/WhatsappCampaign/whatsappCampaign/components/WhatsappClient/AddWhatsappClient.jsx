import React, { useState } from "react";
import { useAddMsg91ClientMutation } from "../../../../redux/apis/Templateapi";

export default function AddWhatsappClient({ onSuccess }) {
    const initialState = {
        user_full_name: "",
        user_mobile_number: "",
        user_company_name: "",
        user_industry: "",
        services: "SMS",
        user_name: "",
        user_email: "",
    };

    const SERVICES_OPTIONS = ["SMS", "Voice", "Email", "WhatsApp"];
    const INDUSTRY_OPTIONS = [
        "Technology",
        "Healthcare",
        "Finance",
        "Education",
        "Retail",
        "Real Estate",
        "Logistics",
        "Other",
    ];

    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});

    const [
        addMsg91Client,
        { isLoading, isSuccess, isError, error, reset },
    ] = useAddMsg91ClientMutation();

    // ───────── VALIDATION ─────────
    const validate = () => {
        const errs = {};

        if (!formData.user_full_name.trim())
            errs.user_full_name = "Full name is required";

        if (!/^\d{10,15}$/.test(formData.user_mobile_number))
            errs.user_mobile_number =
                "Enter valid mobile number (10–15 digits only)";

        if (!formData.user_company_name.trim())
            errs.user_company_name = "Company name is required";

        if (!formData.user_industry)
            errs.user_industry = "Please select industry";

        if (!formData.services)
            errs.services = "Please select service";

        if (!formData.user_name.trim())
            errs.user_name = "Username is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.user_email))
            errs.user_email = "Enter valid email address";

        return errs;
    };

    // ───────── FIELD CHANGE ─────────
    const setField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }

        if (isSuccess || isError) reset();
    };

    // ───────── SUBMIT ─────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        try {
            await addMsg91Client(formData).unwrap();
            setFormData(initialState);
            setErrors({});
            onSuccess?.();
        } catch (err) {
            console.error("API ERROR:", err);
        }
    };

    const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";

    return (
        <div className="max-w-xl bg-white shadow-md rounded-xl p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Add MSG91 Client
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <InputField
                    label="Full Name *"
                    value={formData.user_full_name}
                    onChange={(e) => setField("user_full_name", e.target.value)}
                    error={errors.user_full_name}
                />

                {/* Mobile */}
                <InputField
                    label="Mobile Number *"
                    type="tel"
                    value={formData.user_mobile_number}
                    onChange={(e) =>
                        setField(
                            "user_mobile_number",
                            e.target.value.replace(/\D/g, "")
                        )
                    }
                    error={errors.user_mobile_number}
                />

                {/* Company */}
                <InputField
                    label="Company Name *"
                    value={formData.user_company_name}
                    onChange={(e) => setField("user_company_name", e.target.value)}
                    error={errors.user_company_name}
                />

                {/* Industry */}
                <SelectField
                    label="Industry *"
                    value={formData.user_industry}
                    options={INDUSTRY_OPTIONS}
                    onChange={(e) => setField("user_industry", e.target.value)}
                    error={errors.user_industry}
                />

                {/* Services */}
                <SelectField
                    label="Services *"
                    value={formData.services}
                    options={SERVICES_OPTIONS}
                    onChange={(e) => setField("services", e.target.value)}
                    error={errors.services}
                />

                {/* Username */}
                <InputField
                    label="Username (Email) *"
                    type="email"
                    value={formData.user_name}
                    onChange={(e) => setField("user_name", e.target.value)}
                    error={errors.user_name}
                />

                {/* Email */}
                <InputField
                    label="Email *"
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => setField("user_email", e.target.value)}
                    error={errors.user_email}
                />

                {/* Success */}
                {isSuccess && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                        ✓ Client added successfully!
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                        ✕ {errorMessage}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
                >
                    {isLoading ? "Submitting..." : "Add Client"}
                </button>
            </form>
        </div>
    );
}

/* ───────── INPUT COMPONENT ───────── */
function InputField({ label, error, ...props }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                {...props}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${error
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                    }`}
            />
            {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
        </div>
    );
}

/* ───────── SELECT COMPONENT ───────── */
function SelectField({ label, options, error, ...props }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <select
                {...props}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${error
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-blue-200"
                    }`}
            >
                <option value="">Select</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
        </div>
    );
}