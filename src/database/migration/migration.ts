import house from "../models/house.model";
import kyc from "../models/kyc.model";
import otps from "../models/otps.model";
import subHouse from "../models/sub_house.model";
import users from "../models/users.model";
class migrate {
    constructor() {
        this.run()
    }

    private run = async () => {
        await users.sync();
        await otps.sync();
        await kyc.sync();
        await house.sync();
        await subHouse.sync();
    }
}
export default new migrate();