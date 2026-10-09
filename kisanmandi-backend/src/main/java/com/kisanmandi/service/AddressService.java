package com.kisanmandi.service;

import com.kisanmandi.dto.AddressRequest;
import com.kisanmandi.dto.AddressResponse;
import com.kisanmandi.entity.Address;
import com.kisanmandi.entity.User;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.AddressRepository;
import com.kisanmandi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getCustomerAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Address> existing = addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId);
        boolean isFirst = existing.isEmpty();

        // If user wants this to be default, unset others
        if (request.isDefaultAddress() && !isFirst) {
            unsetOtherDefaults(existing);
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .line1(request.getLine1())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .defaultAddress(isFirst || request.isDefaultAddress()) // First is always default
                .build();

        Address saved = addressRepository.save(address);
        return mapToResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        Address address = getAddressBelongingToUser(addressId, userId);

        if (request.isDefaultAddress() && !address.isDefaultAddress()) {
            List<Address> all = addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId);
            unsetOtherDefaults(all);
            address.setDefaultAddress(true);
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setLine1(request.getLine1());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());

        return mapToResponse(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address address = getAddressBelongingToUser(addressId, userId);
        boolean wasDefault = address.isDefaultAddress();
        
        addressRepository.delete(address);

        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefaultAddress(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Transactional
    public void setDefaultAddress(Long userId, Long addressId) {
        Address address = getAddressBelongingToUser(addressId, userId);
        
        if (address.isDefaultAddress()) return;

        List<Address> all = addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId);
        unsetOtherDefaults(all);
        
        address.setDefaultAddress(true);
        addressRepository.save(address);
    }

    private Address getAddressBelongingToUser(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address not found"); // Hide ownership
        }
        return address;
    }

    private void unsetOtherDefaults(List<Address> addresses) {
        for (Address a : addresses) {
            if (a.isDefaultAddress()) {
                a.setDefaultAddress(false);
                addressRepository.save(a);
            }
        }
    }

    private AddressResponse mapToResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .line1(address.getLine1())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .defaultAddress(address.isDefaultAddress())
                .build();
    }
}
