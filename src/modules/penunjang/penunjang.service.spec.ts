import { Test, TestingModule } from '@nestjs/testing';
import { PenunjangService } from './penunjang.service';

describe('PenunjangService', () => {
  let service: PenunjangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PenunjangService],
    }).compile();

    service = module.get<PenunjangService>(PenunjangService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
