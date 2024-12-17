import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './UpdateRecipe.css';

const UpdateRecipe = () => {
  const { id } = useParams(); // Get recipe ID from the URL
  const [recipe, setRecipe] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState(''); // Added category state
  const [categories, setCategories] = useState([]); // State for available categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch(`http://localhost:8000/api/recipes/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRecipe(data);
          setTitle(data.title);
          setDescription(data.description);
          setIngredients(data.ingredients);
          setInstructions(data.instructions);
          setCategory(data.category); // Set initial category
        } else {
          setError('Failed to fetch recipe details.');
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('An error occurred while fetching recipe details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      const token = localStorage.getItem('accessToken');
      try {
        const response = await fetch('http://localhost:8000/api/categories/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.log('Failed to fetch categories.');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchRecipe();
    fetchCategories();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const token = localStorage.getItem('accessToken');

    const updatedData = {
      title,
      description,
      ingredients,
      instructions,
      category, // Include category in the update payload
    };

    try {
      const response = await fetch(`http://localhost:8000/api/recipes/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedRecipe = await response.json();
        console.log('Recipe updated successfully:', updatedRecipe);
        navigate(`/recipes/${id}`); // Redirect to recipe details
      } else {
        const errorData = await response.json();
        console.error('Failed to update recipe:', errorData);
        alert(`Failed to update recipe. Error: ${JSON.stringify(errorData)}`);
      }
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError('An error occurred while updating the recipe.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="update-recipe-container">
      <h2>Update Recipe</h2>
      <form onSubmit={handleUpdate}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        <textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Ingredients"
          required
        />
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Instructions"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button type="submit">Update Recipe</button>
      </form>
      <Link to="/recipes">
        <button className="back-button">Back to Recipe List</button>
      </Link>
    </div>
  );
};

export default UpdateRecipe;
