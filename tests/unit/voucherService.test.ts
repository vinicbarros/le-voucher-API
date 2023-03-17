import { jest } from "@jest/globals";
import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";
describe("voucherService tests", () => {
  describe("createVoucher test suite", () => {
    it("should not create voucher if the passed code already exists", async () => {
      const voucher = {
        code: "a1a2a4",
        discount: 10,
      };

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => voucher);

      const promise = voucherService.createVoucher(
        voucher.code,
        voucher.discount
      );

      expect(promise).rejects.toEqual({
        message: "Voucher already exist.",
        type: "conflict",
      });
    });

    it("should create voucher", async () => {
      const voucher = {
        id: 1,
        code: "a1a2a4",
        discount: 10,
        used: false,
      };

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => undefined);

      jest
        .spyOn(voucherRepository, "createVoucher")
        .mockImplementationOnce((): any => voucher);

      const result = await voucherService.createVoucher(
        voucher.code,
        voucher.discount
      );

      expect(result).toEqual(voucher);
    });
  });

  describe("applyVoucher test suite", () => {
    it("should return an error if the voucher does not exist", async () => {
      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => undefined);

      const promise = voucherService.applyVoucher("a1a2a3", 100);

      expect(promise).rejects.toEqual({
        message: "Voucher does not exist.",
        type: "conflict",
      });
    });

    it("should not apply the discount if the amount is not greater or equal to 100", async () => {
      const voucher = {
        id: 1,
        code: "a1a2a4",
        discount: 10,
        used: false,
      };

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => voucher);

      const result = await voucherService.applyVoucher("a1a2a4", 99);

      expect(result.applied).toEqual(false);
    });

    it("should not apply the discount if the voucher is already used", async () => {
      const voucher = {
        id: 1,
        code: "a1a2a4",
        discount: 10,
        used: true,
      };

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => voucher);

      const result = await voucherService.applyVoucher("a1a2a4", 200);

      expect(result.applied).toEqual(false);
    });

    it("should apply the discount for values equal or greater than 100 with a valid voucher", async () => {
      const voucher = {
        id: 1,
        code: "a1a2a4",
        discount: 10,
        used: false,
      };
      const amount = 200;

      jest
        .spyOn(voucherRepository, "getVoucherByCode")
        .mockImplementationOnce((): any => voucher);

      jest
        .spyOn(voucherRepository, "useVoucher")
        .mockImplementation((): any => {});

      const result = await voucherService.applyVoucher("a1a2a4", amount);

      expect(result.applied).toEqual(true);
      expect(result.amount).toBe(amount);
      expect(result.discount).toBe(voucher.discount);
      expect(result.finalAmount).toBe(
        amount - amount * (voucher.discount / 100)
      );
    });
  });
});
