import { Test, TestingModule } from '@nestjs/testing';
import { PengabdianController } from './pengabdian.controller';
import { PengabdianService } from './pengabdian.service';

describe('PengabdianController', () => {
  let controller: PengabdianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PengabdianController],
      providers: [PengabdianService],
    }).compile();

    controller = module.get<PengabdianController>(PengabdianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
