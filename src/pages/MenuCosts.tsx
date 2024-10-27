import React, { useState, useMemo } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { Search } from 'lucide-react';
import type { MenuItem, Product } from '../types';
import MenuCostForm from '../components/menu-costs/MenuCostForm';
import MenuCostsPdf from '../components/menu-costs/MenuCostsPdf';
import Card from '../components/Card';
import PageTitle from '../components/PageTitle';

function MenuCosts() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => 
    storage.get<MenuItem>(STORAGE_KEYS.MENU_ITEMS) || []
  );
  const [products] = useState<Product[]>(() => 
    storage.get<Product>(STORAGE_KEYS.PRODUCTS) || []
  );

  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    ingredients: [{ productId: '', quantity: '' }]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [productSearches, setProductSearches] = useState<string[]>(['']);
  const [showProductDropdowns, setShowProductDropdowns] = useState<boolean[]>([false]);

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return menuItems;
    
    const search = searchTerm.toLowerCase();
    return menuItems.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(search);
      const ingredientMatch = item.ingredients.some(ing => {
        const product = products.find(p => p.id === ing.productId);
        return product?.name.toLowerCase().includes(search);
      });
      return nameMatch || ingredientMatch;
    });
  }, [menuItems, products, searchTerm]);

  const filteredProducts = useMemo(() => {
    return productSearches.map(search => {
      if (!search?.trim()) return [];
      const searchTerm = search.toLowerCase().trim();
      return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
      );
    });
  }, [products, productSearches]);

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number') return '₺0,00';
    return amount.toLocaleString('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    });
  };

  const calculateTotalCost = (ingredients: { productId: string, quantity: string | number }[]) => {
    return ingredients.reduce((total, ingredient) => {
      const product = products.find(p => p.id === ingredient.productId);
      if (!product) return total;
      
      const quantity = typeof ingredient.quantity === 'string' 
        ? parseFloat(ingredient.quantity) || 0
        : ingredient.quantity;
      
      return total + (product.currentPrice * quantity);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const menuItem: MenuItem = {
      id: storage.generateId(),
      name: newMenuItem.name,
      ingredients: newMenuItem.ingredients
        .filter(ing => ing.productId && ing.quantity)
        .map(ingredient => ({
          productId: ingredient.productId,
          quantity: parseFloat(ingredient.quantity) || 0
        })),
      totalCost: calculateTotalCost(newMenuItem.ingredients),
      updatedAt: new Date().toISOString()
    };

    const updatedMenuItems = [...menuItems, menuItem];
    storage.set(STORAGE_KEYS.MENU_ITEMS, updatedMenuItems);
    setMenuItems(updatedMenuItems);
    setNewMenuItem({ name: '', ingredients: [{ productId: '', quantity: '' }] });
    setProductSearches(['']);
    setShowProductDropdowns([false]);
  };

  const handleDelete = (id: string) => {
    const updatedMenuItems = menuItems.filter(item => item.id !== id);
    storage.set(STORAGE_KEYS.MENU_ITEMS, updatedMenuItems);
    setMenuItems(updatedMenuItems);
  };

  const updateMenuItemCosts = () => {
    const updatedMenuItems = menuItems.map(menuItem => ({
      ...menuItem,
      totalCost: calculateTotalCost(menuItem.ingredients),
      updatedAt: new Date().toISOString()
    }));
    storage.set(STORAGE_KEYS.MENU_ITEMS, updatedMenuItems);
    setMenuItems(updatedMenuItems);
  };

  const handleProductSearch = (index: number, value: string) => {
    const newSearches = [...productSearches];
    newSearches[index] = value;
    setProductSearches(newSearches);

    const newDropdowns = [...showProductDropdowns];
    newDropdowns[index] = true;
    setShowProductDropdowns(newDropdowns);

    // Clear product ID if search is empty
    if (!value) {
      const updatedIngredients = [...newMenuItem.ingredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        productId: ''
      };
      setNewMenuItem({ ...newMenuItem, ingredients: updatedIngredients });
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const updatedIngredients = [...newMenuItem.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      productId
    };
    setNewMenuItem({ ...newMenuItem, ingredients: updatedIngredients });

    const newSearches = [...productSearches];
    newSearches[index] = product.name;
    setProductSearches(newSearches);

    const newDropdowns = [...showProductDropdowns];
    newDropdowns[index] = false;
    setShowProductDropdowns(newDropdowns);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle>Maliyet Raporu</PageTitle>
        <div className="flex items-center gap-4">
          <button
            onClick={updateMenuItemCosts}
            className="btn-secondary"
          >
            Maliyetleri Güncelle
          </button>
          <MenuCostsPdf 
            menuItems={filteredMenuItems}
            products={products}
            searchTerm={searchTerm}
          />
        </div>
      </div>
      
      <Card>
        <MenuCostForm
          newMenuItem={newMenuItem}
          productSearches={productSearches}
          showProductDropdowns={showProductDropdowns}
          filteredProducts={filteredProducts}
          onSubmit={handleSubmit}
          onMenuItemChange={(name) => setNewMenuItem({ ...newMenuItem, name })}
          onIngredientChange={(index, field, value) => {
            const updatedIngredients = [...newMenuItem.ingredients];
            updatedIngredients[index] = {
              ...updatedIngredients[index],
              [field]: value
            };
            setNewMenuItem({ ...newMenuItem, ingredients: updatedIngredients });
          }}
          onProductSearch={handleProductSearch}
          onProductSelect={handleProductSelect}
          onAddIngredient={() => {
            setNewMenuItem({
              ...newMenuItem,
              ingredients: [...newMenuItem.ingredients, { productId: '', quantity: '' }]
            });
            setProductSearches([...productSearches, '']);
            setShowProductDropdowns([...showProductDropdowns, false]);
          }}
          onRemoveIngredient={(index) => {
            const updatedIngredients = newMenuItem.ingredients.filter((_, i) => i !== index);
            setNewMenuItem({ ...newMenuItem, ingredients: updatedIngredients });
            
            const newSearches = productSearches.filter((_, i) => i !== index);
            setProductSearches(newSearches);
            
            const newDropdowns = showProductDropdowns.filter((_, i) => i !== index);
            setShowProductDropdowns(newDropdowns);
          }}
          formatCurrency={formatCurrency}
        />
      </Card>

      <Card>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Menü Kalemi veya Hammadde Ara
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Aramak istediğiniz menü kalemi veya hammadde adını yazın..."
              className="form-input pl-10"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Menü Kalemi</th>
                <th className="table-header">Hammaddeler</th>
                <th className="table-header">Toplam Maliyet</th>
                <th className="table-header">Son Güncelleme</th>
                <th className="table-header">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMenuItems.map((menuItem) => (
                <tr key={menuItem.id}>
                  <td className="table-cell">{menuItem.name}</td>
                  <td className="table-cell">
                    <ul className="list-disc list-inside">
                      {menuItem.ingredients.map((ingredient, index) => {
                        const product = products.find(p => p.id === ingredient.productId);
                        if (!product) return null;
                        return (
                          <li key={index}>
                            {product.name}: {ingredient.quantity} {product.unit}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="table-cell">
                    {formatCurrency(menuItem.totalCost)}
                  </td>
                  <td className="table-cell">
                    {new Date(menuItem.updatedAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleDelete(menuItem.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMenuItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-cell text-center text-gray-500">
                    {searchTerm ? 'Arama kriterine uygun menü kalemi bulunamadı' : 'Henüz menü kalemi eklenmemiş'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default MenuCosts;