"use client";

import React, { useState } from 'react';
import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
}

const AddressManager: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "1",
      fullName: "Nguyễn Văn A",
      phone: "0987654321",
      address: "123 Đường ABC, Phường XYZ",
      city: "Quận 1, TP. Hồ Chí Minh",
      isDefault: true,
    },
    {
      id: "2",
      fullName: "Nguyễn Văn A",
      phone: "0987654321",
      address: "456 Đường DEF, Phường UVW",
      city: "Quận 2, TP. Hồ Chí Minh",
      isDefault: false,
    }
  ]);
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    isDefault: false,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleAddNew = () => {
    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      isDefault: false,
    });
    setIsAddingAddress(true);
    setEditingAddressId(null);
  };
  
  const handleEdit = (id: string) => {
    const addressToEdit = addresses.find(addr => addr.id === id);
    if (addressToEdit) {
      setFormData({
        fullName: addressToEdit.fullName,
        phone: addressToEdit.phone,
        address: addressToEdit.address,
        city: addressToEdit.city,
        isDefault: addressToEdit.isDefault,
      });
      setEditingAddressId(id);
      setIsAddingAddress(true);
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddressId) {
      // Update existing address
      setAddresses(prev => 
        prev.map(addr => {
          if (addr.id === editingAddressId) {
            return { ...formData, id: addr.id };
          }
          // If setting this address as default, unset other defaults
          if (formData.isDefault && addr.isDefault) {
            return { ...addr, isDefault: false };
          }
          return addr;
        })
      );
    } else {
      // Add new address
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
      };
      
      // If setting this address as default, unset other defaults
      if (formData.isDefault) {
        setAddresses(prev => 
          prev.map(addr => ({ ...addr, isDefault: false })).concat(newAddress)
        );
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }
    }
    
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };
  
  const handleCancel = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };
  
  const handleSetDefault = (id: string) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };
  
  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          Địa chỉ giao hàng
        </h2>
        
        {!isAddingAddress && (
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Thêm địa chỉ mới
          </button>
        )}
      </div>
      
      {isAddingAddress ? (
        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">
            {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Thành phố/Tỉnh
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {editingAddressId ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      ) : addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map(address => (
            <div 
              key={address.id} 
              className={`p-4 border rounded-md ${address.isDefault ? 'border-primary bg-primary-50' : 'border-gray-200'}`}
            >
              <div className="flex flex-col sm:flex-row justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="font-medium">
                      {address.fullName}
                    </span>
                    {address.isDefault && (
                      <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{address.address}</p>
                  <p className="text-gray-600">{address.city}</p>
                  <p className="text-gray-600">Điện thoại: {address.phone}</p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-start space-x-3">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-sm text-primary hover:underline"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(address.id)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Chỉnh sửa"
                  >
                    <Pencil1Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Xóa"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500 mb-4">Bạn chưa có địa chỉ giao hàng nào</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Thêm địa chỉ mới
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
