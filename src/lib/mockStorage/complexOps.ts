import { Apartment, Block, ComplexPlanPrice, SubscriptionPlan, Customer, Vehicle } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase } from "./database";
import { DEFAULT_APARTMENTS, DEFAULT_BLOCKS, DEFAULT_PLANS, DEMO_AGENCY_ID } from "./seeds";

export const complexOps = {
  getApartments(): Apartment[] {
    initializeMockDatabase();
    const apartments = getStorageItem<Apartment[]>("sv_apartments", DEFAULT_APARTMENTS);
    const blocks = getStorageItem<Block[]>("sv_blocks", DEFAULT_BLOCKS);

    return apartments.map(apt => ({
      ...apt,
      blocks: blocks.filter(b => b.apartment_id === apt.id).map(b => ({ id: b.id, name: b.name }))
    }));
  },

  addApartment(name: string, address: string, city: string): Apartment {
    initializeMockDatabase();
    const apartments = getStorageItem<Apartment[]>("sv_apartments", []);
    const newApt: Apartment = {
      id: `apt-${Date.now()}`,
      name,
      address: address || null,
      city: city || null,
      agency_id: DEMO_AGENCY_ID
    };
    apartments.push(newApt);
    setStorageItem("sv_apartments", apartments);
    return newApt;
  },

  updateApartment(id: string, name: string, address: string, city: string): Apartment | null {
    initializeMockDatabase();
    const apartments = getStorageItem<Apartment[]>("sv_apartments", []);
    const index = apartments.findIndex(a => a.id === id);
    if (index === -1) return null;
    apartments[index].name = name;
    apartments[index].address = address || null;
    apartments[index].city = city || null;
    setStorageItem("sv_apartments", apartments);
    return apartments[index];
  },

  addBlock(apartmentId: string, name: string): Block {
    initializeMockDatabase();
    const blocks = getStorageItem<Block[]>("sv_blocks", []);
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      apartment_id: apartmentId,
      name
    };
    blocks.push(newBlock);
    setStorageItem("sv_blocks", blocks);
    return newBlock;
  },

  deleteBlock(id: string): boolean {
    initializeMockDatabase();
    const blocks = getStorageItem<Block[]>("sv_blocks", []);
    const customers = getStorageItem<Customer[]>("sv_customers", []);

    const blockIndex = blocks.findIndex(b => b.id === id);
    if (blockIndex === -1) return false;

    const newBlocks = blocks.filter(b => b.id !== id);
    setStorageItem("sv_blocks", newBlocks);

    const newCustomers = customers.map(c => {
      if (c.block_id === id) {
        return { ...c, block_id: null };
      }
      return c;
    });
    setStorageItem("sv_customers", newCustomers);

    return true;
  },

  getComplexPlanPrices(complexId: string): ComplexPlanPrice[] {
    initializeMockDatabase();
    const prices = getStorageItem<ComplexPlanPrice[]>("sv_complex_plan_prices", []);
    return prices.filter(p => p.apartment_id === complexId);
  },

  saveComplexPlanPrices(complexId: string, prices: ComplexPlanPrice[]): boolean {
    initializeMockDatabase();
    let allPrices = getStorageItem<ComplexPlanPrice[]>("sv_complex_plan_prices", []);
    allPrices = allPrices.filter(p => p.apartment_id !== complexId);
    allPrices.push(...prices);
    setStorageItem("sv_complex_plan_prices", allPrices);
    return true;
  },

  getPlanPriceForComplex(apartmentId: string, planId: string, vehicleType: string, plansList?: SubscriptionPlan[]): number {
    initializeMockDatabase();
    const complexPrices = getStorageItem<ComplexPlanPrice[]>("sv_complex_plan_prices", []);
    const matchedComplexPrice = complexPrices.find(cp => cp.apartment_id === apartmentId && cp.plan_id === planId);
    
    if (matchedComplexPrice) {
      switch (vehicleType) {
        case "hatchback": return matchedComplexPrice.price_hatchback;
        case "sedan": return matchedComplexPrice.price_sedan;
        case "suv": return matchedComplexPrice.price_suv;
        case "luxury": return matchedComplexPrice.price_luxury;
        case "bike": return matchedComplexPrice.price_bike;
        default: return matchedComplexPrice.price_hatchback;
      }
    }

    const plans = plansList || getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
    const plan = plans.find(p => p.id === planId);
    if (!plan) return 0;

    switch (vehicleType) {
      case "hatchback": return plan.price_hatchback !== undefined ? plan.price_hatchback : plan.price_car;
      case "sedan": return plan.price_sedan !== undefined ? plan.price_sedan : plan.price_car;
      case "suv": return plan.price_suv !== undefined ? plan.price_suv : plan.price_car;
      case "luxury": return plan.price_luxury !== undefined ? plan.price_luxury : plan.price_car;
      case "bike": return plan.price_bike;
      default: return plan.price_car;
    }
  }
};
