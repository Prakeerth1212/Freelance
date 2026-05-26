package com.freelancehub.service;

import com.freelancehub.dao.ClientDAO;
import com.freelancehub.model.Client;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    private final ClientDAO clientDAO;

    public ClientService(ClientDAO clientDAO) {
        this.clientDAO = clientDAO;
    }

    public Client create(Client client) {
        return clientDAO.insert(client);
    }

    public Optional<Client> getById(int id) {
        return clientDAO.getById(id);
    }

    public List<Client> getAll() {
        return clientDAO.getAll();
    }

    public boolean update(Client client) {
        return clientDAO.update(client);
    }

    public boolean delete(int id) {
        return clientDAO.delete(id);
    }
}
