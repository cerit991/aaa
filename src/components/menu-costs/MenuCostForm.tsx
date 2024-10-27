import React from 'react';
import { X } from 'lucide-react';
import type { Product } from '../../types';

interface MenuCostFormProps {
  newMenuItem: {
    name: string;
    ingredients: {
      productId: string;
      quantity: string;
    }[];
  };
  productSearches: string[];
  showProductDropdowns: boolean[];
  filteredProducts: Product[][];
  onSubmit: (e: React.FormEvent) => void;
  onMenuItemChange: (name: string) => void;
  onIngredientChange: (index: number, field: string, value: string) => void;
  onProductSearch: (index: number, value: string) => void;
  onProductSelect: (index: number, productId: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  formatCurrency: (amount: number | undefined) => string;
}

function MenuCostForm({
  newMenuItem,
  productSearches,
  showProductDropdowns,
  filteredProducts,
  onSubmit,
  onMenuItemChange,
  onIngredientChange,
  onProductSearch,
  onProductSelect,
  onAddIngredient,
  onRemoveIngredient,
  formatCurrency
}: MenuCostFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Menü Kalemi Adı</label>
        <input
          type="text"
          required
          value={newMenuItem.name}
          onChange={(e) => onMenuItemChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        {newMenuItem.ingredients.map((ingredient, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg relative">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hammadde</label>
              <div className="relative">
                <input
                  type="text"
                  value={productSearches[index]}
                  onChange={(e) => onProductSearch(index, e.target.value)}
                  placeholder="Hammadde ara..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {showProductDropdowns[index] && productSearches[index] && filteredProducts[index]?.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProducts[index].map(product => (
                      <div
                        key={product.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => onProductSelect(index, product.id)}
                      >
                        <div>{product.name}</div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(product.currentPrice)} / {product.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Miktar
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={ingredient.quantity}
                onChange={(e) => onIngredientChange(index, 'quantity', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {index > 0 && (
              <button
                type="button"
                onClick={() => onRemoveIngredient(index)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onAddIngredient}
          className="btn-secondary"
        >
          Yeni Hammadde Ekle
        </button>

        <button
          type="submit"
          className="btn-primary"
        >
          Menü Kalemi Ekle
        </button>
      </div>
    </form>
  );
}

export default MenuCostForm;