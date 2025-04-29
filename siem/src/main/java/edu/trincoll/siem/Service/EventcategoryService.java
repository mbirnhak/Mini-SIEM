package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Eventcategory;
import edu.trincoll.siem.Repository.EventcategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventcategoryService {

    @Autowired
    private EventcategoryRepository eventcategoryRepository;

    // Get all categories
    public List<Eventcategory> getAllCategories() {
        return eventcategoryRepository.findAll();
    }

    // Get all categories sorted by name
    public List<Eventcategory> getAllCategoriesSorted() {
        return eventcategoryRepository.findAllOrderedByName();
    }

    // Get category by name
    public Optional<Eventcategory> getCategoryByName(String categoryName) {
        return eventcategoryRepository.findByCategoryname(categoryName);
    }

    // Search categories by term
    public List<Eventcategory> searchCategories(String searchTerm) {
        return eventcategoryRepository.searchCategories(searchTerm);
    }

    // Create a new category
    public Eventcategory createCategory(Eventcategory category) {
        return eventcategoryRepository.save(category);
    }

    // Update a category
    public Optional<Eventcategory> updateCategory(String categoryName, Eventcategory categoryDetails) {
        return eventcategoryRepository.findByCategoryname(categoryName)
                .map(existingCategory -> {
                    existingCategory.setDescription(categoryDetails.getDescription());
                    return eventcategoryRepository.save(existingCategory);
                });
    }

    // Delete a category
    public boolean deleteCategory(String categoryName) {
        return eventcategoryRepository.findByCategoryname(categoryName)
                .map(category -> {
                    eventcategoryRepository.delete(category);
                    return true;
                }).orElse(false);
    }

    // Check if category exists
    public boolean categoryExists(String categoryName) {
        return eventcategoryRepository.existsByCategoryname(categoryName);
    }
}