import { Inject } from '@nestjs/common';

export const MAKECOMMERCE_CLIENT = Symbol('MAKECOMMERCE_CLIENT');
export const MAKECOMMERCE_MODULE_OPTIONS = Symbol('MAKECOMMERCE_MODULE_OPTIONS');

export function InjectMakeCommerceClient(): ParameterDecorator {
  return Inject(MAKECOMMERCE_CLIENT);
}
