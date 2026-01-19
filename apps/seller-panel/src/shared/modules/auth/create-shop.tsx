import Button from "@/app/shared/components/button";
import Input from "@/app/shared/components/input";
import { shopCategories } from "@/utils/categories";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="mb-4 font-semibold text-2xl text-center">
          Setup new Shop
        </h3>

        <Input
          label="Shop Name *"
          type="text"
          register={register}
          errors={errors}
          rules={{
            required: "Shop Name is Required!",
          }}
          name="name"
          placeholder="Enter shop Name"
        />
        <label htmlFor="" className="block mb-1 text-gray-700">
          Bio *
        </label>
        <textarea
          cols={10}
          rows={4}
          placeholder="Shop Bio"
          className="mb-1 p-2 border border-gray-300 rounded-[4px] outline-0 w-full"
          {...register("bio", {
            required: "Shop bio is required",
            validate: (value) =>
              countWords(value) <= 100 || "Bio cannot be more than 100 words",
          })}
        />
        {errors.bio && (
          <p className="mt-1 text-red-500 text-sm">
            {String(errors.bio.message)}
          </p>
        )}

        <Input
          label="Shop Location"
          type="text"
          register={register}
          errors={errors}
          name="address"
          rules={{
            required: "Shop Location is Required!",
          }}
          placeholder="Enter shop Address"
        />
        <Input
          label="Opeaning Hours"
          type="text"
          register={register}
          errors={errors}
          name="opening_hours"
          rules={{
            required: "Opening Hours is Required!",
          }}
          placeholder="Eg. Sun-Fri 9AM - 6PM"
        />
        <Input
          label="Website"
          type="text"
          register={register}
          errors={errors}
          rules={{
            pattern: {
              value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
              message: "Enter a valid Url",
            },
          }}
          name="website"
          placeholder="Eg. https://website.com"
        />
        <label className="block mb-1 font-Roboto text-gray-700 text-sm">
          Category *
        </label>
        <select
          id=""
          className="mb-4 p-3 border border-gray-300 rounded-[4px] outline-0 w-full"
          {...register("category", { required: "Category is required" })}
        >
          <option value="">Select a category</option>
          {shopCategories.map((category) => (
            <option value={category.value} key={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}

        <Button
          disabled={shopCreateMutation.isPending}
          label={shopCreateMutation.isPending ? "Creating....." : "Create Shop"}
          type="submit"
        />
      </form>
    </div>
  );
};

export default CreateShop;
