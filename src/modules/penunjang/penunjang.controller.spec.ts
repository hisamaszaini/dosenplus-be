import { Test, TestingModule } from '@nestjs/testing';
import { PenunjangController } from './penunjang.controller';
import { PenunjangService } from './penunjang.service';

describe('PenunjangController', () => {
  let controller: PenunjangController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenunjangController],
      providers: [PenunjangService],
    }).compile();

    controller = module.get<PenunjangController>(PenunjangController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
