import { keccak256, encodePacked } from "viem"

/**
 * Generates a commitment for an employee.
 * @param {string} wallet - The wallet address of the employee.
 * @param {string} role - The protocol role (e.g., "FARMER", "DISTRIBUTOR").
 * @param {string} secret - A unique secret for the employee.
 * @returns {string} The keccak256 commitment hash.
 */
export function generateEmployeeCommitment(wallet, role, secret) {
    return keccak256(encodePacked(
        ["address", "string", "string"],
        [wallet, role, secret]
    ))
}

export const PROTOCOL_ROLES = {
    FARMER: "FARMER",
    DISTRIBUTOR: "DISTRIBUTOR",
    MANUFACTURER: "MANUFACTURER",
    RETAILER: "RETAILER"
}
