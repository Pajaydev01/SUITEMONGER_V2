import kyc from "../models/kyc.model";
import otps from "../models/otps.model";
import users from "../models/users.model";
class migrate {
    constructor() {
        this.run()
    }

    private run = async () => {
        await users.sync();
        await otps.sync();
        await kyc.sync();
    }
}
new migrate()