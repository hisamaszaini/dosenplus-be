import { Test, TestingModule } from '@nestjs/testing';
import { FakultasService } from './fakultas.service';

describe('FakultasService', () => {
  let service: FakultasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FakultasService],
    }).compile();

    service = module.get<FakultasService>(FakultasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
