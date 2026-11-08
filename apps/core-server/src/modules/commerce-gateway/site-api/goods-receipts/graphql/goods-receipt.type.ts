import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

// Major-unit money pair (value is a string, mirroring CurrencyAmountDto / SupplierUnitPrice).
@ObjectType()
export class GoodsReceiptMoney {
  @Field(() => String)
  currency: string;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class GoodsReceiptPo {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  poNumber: string;

  @Field(() => String)
  orderDate: string;

  @Field(() => String, { nullable: true })
  expectedBy: string | null;

  @Field(() => GoodsReceiptMoney)
  totalAmount: GoodsReceiptMoney;
}

// One goods receipt for the mobile list + detail.
@ObjectType()
export class GoodsReceipt {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  grNumber: string;

  @Field(() => ID)
  legalEntityId: string;

  @Field(() => ID)
  siteId: string;

  @Field(() => String)
  supplierId: string;

  @Field(() => String)
  supplierName: string;

  @Field(() => String)
  status: string;

  @Field(() => Boolean)
  isPublishable: boolean;

  @Field(() => Int)
  itemCount: number;

  @Field(() => ID)
  purchaseOrderId: string;

  @Field(() => GoodsReceiptPo)
  po: GoodsReceiptPo;

  @Field(() => String)
  receivedDate: string;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field(() => String, { nullable: true })
  publishedAt: string | null;

  @Field(() => String)
  createdAt: string;
}
