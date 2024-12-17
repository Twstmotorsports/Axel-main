import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddRecipe = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [authorId, setAuthorId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndCategories = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/'); // Redirect if not authenticated
        return;
      }

      try {
        const [userResponse, categoryResponse] = await Promise.all([
          fetch('http://localhost:8000/api/usersprofile/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:8000/api/categories/', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setAuthorId(userData.id);
        } else {
          console.log('Failed to fetch user data');
        }

        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setCategories(categoryData);
        } else {
          console.log('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserAndCategories();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Check if a category is selected or a new one is entered
    if (!selectedCategory && !newCategory) {
      setMessage('Please select or enter a category.');
      setLoading(false);
      return;
    }
  
    let categoryId = selectedCategory; // Default to selected category
  
    // If a new category is entered, check if it already exists and create it if necessary
    if (newCategory) {
      // Check if category already exists
      const duplicateCategory = categories.find(
        (category) => category.name.toLowerCase() === newCategory.toLowerCase()
      );
  
      if (duplicateCategory) {
        setMessage(`The category "${newCategory}" already exists. Please select it from the list.`);
        setLoading(false);
        return;
      }
  
      // Create new category in Django if not already in the list
      try {
        const token = localStorage.getItem('accessToken');
        const categoryResponse = await fetch('http://localhost:8000/api/categories/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newCategory }),
        });
  
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          categoryId = categoryData.id; // Use the newly created category ID
        } else {
          const errorData = await categoryResponse.json();
          setMessage(`Failed to create category: ${errorData.detail || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error creating category:', error);
        setMessage('An error occurred while creating the category.');
        setLoading(false);
        return;
      }
    }
  
    // Check for duplicate recipe
    const token = localStorage.getItem('accessToken');
    try {
      const recipesResponse = await fetch('http://localhost:8000/api/recipes/', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (recipesResponse.ok) {
        const recipes = await recipesResponse.json();
        const duplicateRecipe = recipes.find(
          (recipe) => recipe.title.toLowerCase() === title.toLowerCase()
        );
  
        if (duplicateRecipe) {
          setMessage(`The recipe "${title}" already exists in your recipe list.`);
          setLoading(false);
          return;
        }
      } else {
        console.error('Failed to fetch recipes for duplicate check.');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setMessage('An error occurred while checking for duplicate recipes.');
      setLoading(false);
      return;
    }
  
    // Proceed with recipe submission
    try {
      const response = await fetch('http://localhost:8000/api/recipes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          ingredients,
          instructions,
          category: categoryId,  // Pass the category ID to the recipe
          author: authorId,
        }),
      });
  
      if (response.ok) {
        setMessage('Recipe added successfully!');
        setTitle('');
        setDescription('');
        setIngredients('');
        setInstructions('');
        setSelectedCategory('');
        setNewCategory('');
        navigate('/recipes');
      } else {
        const errorData = await response.json();
        setMessage(`Failed to add recipe: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
      setMessage('An error occurred while adding the recipe.');
    } finally {
      setLoading(false);
    }
  };
  
  
  
  

  return (
    <div>
      <h2>Add a New Recipe</h2>
      <button onClick={() => navigate('/recipes')}>Back to Recipe List</button>
      {message && <p style={{ color: message.startsWith('Failed') ? 'red' : 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <textarea
          placeholder="Ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />
        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Existing Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Or enter a new category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        {authorId && <p style={{ fontSize: '12px', color: 'gray' }}>Author ID: {authorId}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Recipe'}
        </button>
      </form>
    </div>
  );
};

export default AddRecipe;
