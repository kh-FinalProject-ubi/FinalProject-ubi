package edu.kh.project.welfare.like.model.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.kh.project.welfare.benefits.model.dto.Welfare;
import edu.kh.project.welfare.like.model.mapper.WelfareMapper;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class WelfareServiceImpl implements WelfareService {

    private final WelfareMapper welfareMapper;

    @Override
    public void addLike(Welfare dto) {
        Welfare existing = welfareMapper.selectLike(dto);

        if (existing == null) {
            welfareMapper.insertLike(dto);
        } else {
            welfareMapper.reactivateLike(dto);
        }
    }

    @Override
    public void cancelLike(Welfare dto) {
        welfareMapper.deleteLike(dto);
    }

    @Override
    public List<Welfare> selectPopularWelfare() {
        return welfareMapper.selectPopularWelfare();
    }
}
