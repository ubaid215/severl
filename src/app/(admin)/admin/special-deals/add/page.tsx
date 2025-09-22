"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export default function AddSpecialDealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    discount: "",
    discountType: "PERCENTAGE",
    minOrderAmount: "",
    validFrom: "",
    validTo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate form
      if (
        !formData.title ||
        !formData.description ||
        !formData.discount ||
        !formData.validFrom ||
        !formData.validTo
      ) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      if (parseFloat(formData.discount) <= 0) {
        setError("Discount must be greater than 0");
        setLoading(false);
        return;
      }

      if (
        formData.discountType === "PERCENTAGE" &&
        parseFloat(formData.discount) > 100
      ) {
        setError("Percentage discount cannot exceed 100%");
        setLoading(false);
        return;
      }

      const validFromDate = new Date(formData.validFrom);
      const validToDate = new Date(formData.validTo);

      if (validFromDate >= validToDate) {
        setError("Valid from date must be before valid to date");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        discount: parseFloat(formData.discount),
        minOrderAmount: formData.minOrderAmount
          ? parseFloat(formData.minOrderAmount)
          : null,
        validFrom: validFromDate.toISOString(),
        validTo: validToDate.toISOString(),
      };

      const token = localStorage.getItem("admin_token");

      const response = await fetch("/api/special-deals", {
        method: "POST",
        headers: {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Special deal created successfully!");
        setTimeout(() => {
          router.push("/special-deals");
        }, 1500);
      } else {
        setError(data.error || "Failed to create deal");
      }
    } catch (err) {
      setError("An error occurred while creating the deal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-yellow-500 mb-6 hover:text-yellow-400"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Deals
        </button>

        <h1 className="text-3xl font-bold text-yellow-500 mb-6">
          Add New Special Deal
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 text-white p-4 rounded-lg mb-6 flex items-center">
            <CheckCircle size={20} className="mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Discount *
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Order Amount
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Valid From *
              </label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Valid To *
              </label>
              <input
                type="datetime-local"
                name="validTo"
                value={formData.validTo}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push("/admin/special-deals")}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
