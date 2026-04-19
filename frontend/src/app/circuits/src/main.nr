fn main(
    wallet_address : Field,
    secret_salt : Field,
    role_value : Field,
     //public 
     commitment :pub Field,
     required_role :pub Field
) {
     let computed = std::hash::pedersen_hash([
        wallet_address,   
        secret_salt,      
        role_value        
    ]);
    // std::println(computed);
     assert(computed == commitment);
    assert(role_value == required_role);
}
