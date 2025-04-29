package edu.trincoll.siem.Service;

import edu.trincoll.siem.Model.Action;
import edu.trincoll.siem.Model.Eventcategory;
import edu.trincoll.siem.Repository.ActionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActionService {

    private final ActionRepository actionRepository;

    public ActionService(ActionRepository actionRepository) {
        this.actionRepository = actionRepository;
    }

    // Basic CRUD operations
    public List<Action> getAllActions() {
        return actionRepository.findAll();
    }

    public Optional<Action> getActionByName(String actionName) {
        return actionRepository.findById(actionName);
    }

    public Action saveAction(Action action) {
        return actionRepository.save(action);
    }

    public void deleteAction(String actionName) {
        actionRepository.deleteById(actionName);
    }

    // Find by category
    public List<Action> getActionsByCategory(Eventcategory category) {
        return actionRepository.findByCategoryname(category);
    }

    // Find actions with no category
    public List<Action> getActionsWithNoCategory() {
        return actionRepository.findByCategorynameIsNull();
    }

    // Search actions by name
    public List<Action> searchActionsByName(String searchTerm) {
        return actionRepository.findByActionContainingIgnoreCase(searchTerm);
    }

    // Count actions by category
    public List<Object[]> countActionsByCategory() {
        return actionRepository.countActionsByCategory();
    }

    // Check if action exists
    public boolean actionExists(String actionName) {
        return actionRepository.existsById(actionName);
    }
}