package com.mycompany.clinic_management_system.config;

import com.mycompany.clinic_management_system.model.User;
import com.mycompany.clinic_management_system.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataMigrationRunner(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                // Generate a temporary unique email for existing users
                String tempEmail = user.getUsername().replaceAll("\\s+", "").toLowerCase() + "_" + user.getId() + "@tempclinic.com";
                user.setEmail(tempEmail);
                userRepository.save(user);
                System.out.println("Assigned temporary email to user: " + user.getUsername() + " -> " + tempEmail);
            }
        }
    }
}
