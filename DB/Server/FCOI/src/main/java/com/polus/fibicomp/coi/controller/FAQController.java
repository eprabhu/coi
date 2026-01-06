package com.polus.fibicomp.coi.controller;

import com.polus.core.faq.service.FaqService;
import com.polus.core.faq.vo.FaqCategoryVo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/coiCustom")
public class FAQController {

    @Autowired
    private FaqService faqService;

    @PostMapping("/fetchFaqDetails")
    public String loadCategoryCode(@RequestBody FaqCategoryVo vo) {
        return faqService.fetchFaqTable(vo);
    }

    @PostMapping("/listFaqCategory")
    public String listFaqCategory(@RequestBody FaqCategoryVo vo) {
        return faqService.listFaqCategory(vo);
    }

    @RequestMapping(value = "/addFaqAttachment", method = RequestMethod.POST)
    public String addFaqAttachment(@RequestParam(value = "files", required = false) MultipartFile[] files,
                                   @RequestParam("formDataJson") String formDataJson) {
        return faqService.addFaqAttachment(files, formDataJson);

    }

    @PostMapping("/saveFaq")
    public String saveFaq(@RequestBody FaqCategoryVo vo, HttpServletRequest request, HttpServletResponse response) {
        return faqService.saveUpdateFaq(vo);
    }
}
