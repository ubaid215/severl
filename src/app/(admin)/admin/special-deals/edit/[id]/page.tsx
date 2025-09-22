"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

interface SpecialDeal {
  id: string;
  title: string;
  description: string;
  image?: string;
  discount: number;
  discountType: "PERCENTAGE" | "FIXED";
  minOrderAmount?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

export default function EditSpecialDealPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

  useEffect(() => {
    if (id) {
      fetchDeal();
    }
  }, [id]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/special-deals/${id}`);
      const data = await response.json();

      if (data.success) {
        const deal = data.data;
        setFormData({
          title: deal.title,
          description: deal.description,
          image: deal.image || "",
          discount: deal.discount.toString(),
          discountType: deal.discountType,
          minOrderAmount: deal.minOrderAmount?.toString() || "",
          validFrom: new Date(deal.validFrom).toISOString().slice(0, 16),
          validTo: new Date(deal.validTo).toISOString().slice(0, 16),
        });
      } else {
        setError("Failed to fetch deal details");
      }
    } catch (err) {
      setError("Error fetching deal details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    setUpdating(true);
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
        setUpdating(false);
        return;
      }

      if (parseFloat(formData.discount) <= 0) {
        setError("Discount must be greater than 0");
        setUpdating(false);
        return;
      }

      if (
        formData.discountType === "PERCENTAGE" &&
        parseFloat(formData.discount) > 100
      ) {
        setError("Percentage discount cannot exceed 100%");
        setUpdating(false);
        return;
      }

      const validFromDate = new Date(formData.validFrom);
      const validToDate = new Date(formData.validTo);

      if (validFromDate >= validToDate) {
        setError("Valid from date must be before valid to date");
        setUpdating(false);
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

      const response = await fetch(`/api/special-deals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Special deal updated successfully!");
        setTimeout(() => {
          router.push("/admin/special-deals");
        }, 1500);
      } else {
        setError(data.error || "Failed to update deal");
      }
    } catch (err) {
      setError("An error occurred while updating the deal");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push("/admin/special-deals")}
          className="flex items-center text-yellow-500 mb-6 hover:text-yellow-400"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Deals
        </button>

        <h1 className="text-3xl font-bold text-yellow-500 mb-6">
          Edit Special Deal
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
              disabled={updating}
              className="px-6 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Updating..." : "Update Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
