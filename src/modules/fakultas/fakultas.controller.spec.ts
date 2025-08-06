import { Test, TestingModule } from '@nestjs/testing';
import { FakultasController } from './fakultas.controller';

describe('FakultasController', () => {
  let controller: FakultasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FakultasController],
    }).compile();

    controller = module.get<FakultasController>(FakultasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
