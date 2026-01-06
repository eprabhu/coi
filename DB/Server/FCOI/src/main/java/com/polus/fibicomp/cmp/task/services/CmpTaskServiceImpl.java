package com.polus.fibicomp.cmp.task.services;

import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.polus.core.applicationexception.dto.ApplicationException;
import com.polus.core.common.dao.CommonDao;
import com.polus.core.common.service.CommonService;
import com.polus.core.constants.CoreConstants;
import com.polus.core.filemanagement.FileManagementService;
import com.polus.core.person.dao.PersonDao;
import com.polus.core.security.AuthenticatedUser;
import com.polus.core.task.dto.SRTaskOperationType;
import com.polus.core.task.service.TaskService;
import com.polus.fibicomp.cmp.task.dtos.CmpActionDto;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskActionLogDto;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskAttachmentDto;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskCommentDto;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskDto;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskQuestionAnswersDto;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskQuestionsDto;
import com.polus.fibicomp.cmp.task.dtos.CmpTaskWatchersDto;
import com.polus.fibicomp.cmp.task.pojos.CmpTask;
import com.polus.fibicomp.cmp.task.pojos.CmpTaskAttachment;
import com.polus.fibicomp.cmp.task.pojos.CmpTaskComment;
import com.polus.fibicomp.cmp.task.pojos.CmpTaskQuestionAnswers;
import com.polus.fibicomp.cmp.task.pojos.CmpTaskQuestions;
import com.polus.fibicomp.cmp.task.pojos.CmpTaskType;
import com.polus.fibicomp.cmp.task.pojos.CmpTaskWatchers;
import com.polus.fibicomp.cmp.task.repositories.CmpTaskAttachmentRepository;
import com.polus.fibicomp.cmp.task.repositories.CmpTaskCommentRepository;
import com.polus.fibicomp.cmp.task.repositories.CmpTaskQuestionAnswersRepository;
import com.polus.fibicomp.cmp.task.repositories.CmpTaskQuestionsRepository;
import com.polus.fibicomp.cmp.task.repositories.CmpTaskRepository;
import com.polus.fibicomp.cmp.task.repositories.CmpTaskTypeRepository;
import com.polus.fibicomp.cmp.task.repositories.CmpTaskWatchersRepository;
import com.polus.fibicomp.coi.service.ActionLogService;
import com.polus.fibicomp.constants.Constants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("Module_29_TaskService")
@RequiredArgsConstructor
public class CmpTaskServiceImpl implements TaskService<CmpTaskDto, CmpActionDto> {

    private final CommonDao commonDao;
    private final FileManagementService fileManagementService;
    private final CmpTaskRepository cmpTaskRepository;
    private final CmpTaskQuestionsRepository questionsRepository;
    private final CmpTaskWatchersRepository taskWatchersRepository;
    private final CmpTaskAttachmentRepository attachmentRepository;
    private final PersonDao personDao;
    private final CmpTaskQuestionAnswersRepository questionAnswersRepository;
    private final CmpTaskCommentRepository taskCommentRepository;
    private final CommonService commonService;
    private final ActionLogService actionLogService;
    private final CmpTaskTypeRepository cmpTaskTypeRepository;

    private final String ACTION_TYPE_INSERT = "I";
    private final String ACTION_TYPE_DELETE = "D";
    private final String ACTION_TYPE_UPDATE = "U";

    @Override
    public CmpTaskDto executeTaskOperation(SRTaskOperationType operationType, CmpTaskDto task, MultipartFile[] files, HttpServletRequest request) {

        if (operationType == SRTaskOperationType.CREATE) {
            task.setTaskId(null);
            createOrUpdateTask(task, files);
        } else if (operationType == SRTaskOperationType.UPDATE) {
            createOrUpdateTask(task, files);
        } else if (operationType == SRTaskOperationType.STATUS_CHANGE) {
            handleStatusChange(task);
        }

        return null;
    }

    private void handleStatusChange(CmpTaskDto task) {
        if (cmpTaskRepository.existsByTaskIdAndTaskStatusCode(task.getTaskId(), task.getTaskStatusCode())) {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "Task is already in the desired status.");
        }
        CmpTask existingTask = cmpTaskRepository.findById(task.getTaskId())
                .orElseThrow(() -> new ApplicationException("Task not found with ID: " + task.getTaskId(),
                        CoreConstants.JAVA_ERROR));
        String loginPersonId = AuthenticatedUser.getLoginPersonId();
        if (task.getTaskStatusCode().equals(Constants.CMP_TASK_STATUS_COMPLETED_CODE)) {
            existingTask.setCompletionTimestamp(commonDao.getCurrentTimestamp());
        }
        existingTask.setTaskStatusCode(task.getTaskStatusCode());
        existingTask.setUpdateTimestamp(commonDao.getCurrentTimestamp());
        existingTask.setUpdatedBy(loginPersonId);
        cmpTaskRepository.save(existingTask);
        String actionType;
        if (Constants.CMP_TASK_STATUS_COMPLETED_CODE.equals(task.getTaskStatusCode())) {
            actionType = Constants.CMP_TASK_ACTION_LOG_COMPLETED;
        } else {
            actionType = Constants.CMP_TASK_ACTION_LOG_STARTED;
        }
        String taskTypeDescription = cmpTaskTypeRepository.findById(existingTask.getTaskTypeCode())
                .map(CmpTaskType::getDescription)
                .orElse(null);
        CmpTaskActionLogDto logDto = CmpTaskActionLogDto.builder()
                .cmpId(existingTask.getCmpId())
                .taskId(existingTask.getTaskId())
                .taskStatus(existingTask.getTaskStatusCode())
                .assigneeName(
                    existingTask.getAssigneePersonId() != null
                        ? personDao.getPersonFullNameByPersonId(existingTask.getAssigneePersonId())
                        : null
                )
                .taskType(taskTypeDescription)
                .adminName(AuthenticatedUser.getLoginUserFullName())
                .build();
        actionLogService.saveCmpTaskActionLog(actionType, logDto);
    }

    public void createOrUpdateTask(CmpTaskDto dto, MultipartFile[] files) {
        String loginPersonId = AuthenticatedUser.getLoginPersonId();
        Timestamp currentTimestamp = commonDao.getCurrentTimestamp();
        CmpTask task;
        boolean isCreate = dto.getTaskId() == null;
        if (dto.getTaskId() == null) {
            task = new CmpTask();
        } else {
            task = cmpTaskRepository.findById(dto.getTaskId()).get();
        }
        CmpTask oldTask = null;
        if (!isCreate) {
            oldTask = new CmpTask();
            BeanUtils.copyProperties(task, oldTask);
        }
        boolean assigneeChanged = !isCreate &&
                !Objects.equals(oldTask.getAssigneePersonId(), dto.getAssigneePersonId());
        String actionType;
        if (isCreate) {
            actionType = Constants.CMP_TASK_ACTION_LOG_CREATED;
        } else if (assigneeChanged) {
            actionType = Constants.CMP_TASK_ACTION_LOG_REASSIGNED;
        } else {
            actionType = Constants.CMP_TASK_ACTION_LOG_UPDATED;
        }
        task.setTaskId(dto.getTaskId());
        task.setTaskTypeCode(dto.getTaskTypeCode());
        task.setTaskStatusCode(dto.getTaskStatusCode());
        task.setAssigneePersonId(dto.getAssigneePersonId());
        task.setAssignedOn(currentTimestamp);
        task.setDescription(dto.getDescription());
        task.setDueDate(dto.getDueDate());
        task.setCmpId(dto.getCmpId());
        if (dto.getTaskId() == null) {
            task.setCreateTimestamp(currentTimestamp);
            task.setCreatedBy(loginPersonId);
        }
        task.setUpdateTimestamp(currentTimestamp);
        task.setUpdatedBy(loginPersonId);
        task = cmpTaskRepository.save(task);
        String taskTypeDescription = cmpTaskTypeRepository.findById(task.getTaskTypeCode())
                .map(CmpTaskType::getDescription)
                .orElse(null);
		CmpTaskActionLogDto logDto = CmpTaskActionLogDto.builder().cmpId(task.getCmpId()).taskId(task.getTaskId())
				.taskType(task.getTaskTypeCode()).taskStatus(task.getTaskStatusCode())
				.assigneeName(task.getAssigneePersonId() != null
						? personDao.getPersonFullNameByPersonId(task.getAssigneePersonId())
						: null)
				.taskType(taskTypeDescription)
				.adminName(AuthenticatedUser.getLoginUserFullName()).comment(task.getDescription()).build();
		actionLogService.saveCmpTaskActionLog(actionType, logDto);
        if (dto.getCmpTaskQuestions() != null) {
            for (CmpTaskQuestionsDto q : dto.getCmpTaskQuestions()) {
                if (q.getActionType() != null && q.getActionType().equals(ACTION_TYPE_DELETE)) {
                    questionsRepository.deleteById(q.getCmpTaskQuestionId());
                    continue;
                }
                CmpTaskQuestions question;
                if (q.getCmpTaskQuestionId() == null) {
                    question = new CmpTaskQuestions();
                } else {
                    question = questionsRepository.findById(q.getCmpTaskQuestionId()).get();
                }
                question.setCmpTaskQuestionId(q.getCmpTaskQuestionId());
                question.setTaskId(task.getTaskId());
                question.setQuestion(q.getQuestion());
                question.setDescription(q.getDescription());
                if (q.getCmpTaskQuestionId() == null) {
                    question.setCreateTimestamp(currentTimestamp);
                    question.setCreatedBy(loginPersonId);
                }
                question.setUpdateTimestamp(currentTimestamp);
                question.setUpdatedBy(loginPersonId);
                questionsRepository.save(question);
            }
        }
        if (dto.getCmpTaskWatchers() != null) {
            for (CmpTaskWatchersDto w : dto.getCmpTaskWatchers()) {
                if (w.getActionType() != null && w.getActionType().equals(ACTION_TYPE_DELETE)) {
                    taskWatchersRepository.deleteById(w.getCmpTaskWatcherId());
                    continue;
                }
                CmpTaskWatchers watcher = new CmpTaskWatchers();
                watcher.setCmpTaskWatcherId(w.getCmpTaskWatcherId());
                watcher.setTaskId(task.getTaskId());
                watcher.setWatcherPersonId(w.getWatcherPersonId());
                watcher.setUpdateTimestamp(currentTimestamp);
                watcher.setUpdatedBy(loginPersonId);
                taskWatchersRepository.save(watcher);
            }
        }
        Integer documentId = 1;
        if (files != null) {
            for (int i = 0; i < files.length; i++) {
                for (CmpTaskAttachmentDto newAttachment : dto.getCmpTaskAttachments()) {
                    if (newAttachment.getActionType() != null && newAttachment.getActionType().equals(ACTION_TYPE_DELETE)) {
                        deleteFilesById(newAttachment.getFileDataId());
                        attachmentRepository.deleteById(newAttachment.getAttachmentId());
                        continue;
                    }
                    File file = new File(files[i].getOriginalFilename());
                    String fileName = file.getName();
                    if (newAttachment.getFileName().equals(fileName)) {
                        CmpTaskAttachment attachment = addNewTaskAttachment(newAttachment, files[i], fileName, documentId);
                        attachment.setAttachmentId(newAttachment.getAttachmentId());
                        attachment.setTaskId(task.getTaskId());
                        attachment.setDescription(newAttachment.getDescription());
                        if (newAttachment.getAttachmentId() == null) {
                            attachment.setCreateTimestamp(currentTimestamp);
                            attachment.setCreatedBy(loginPersonId);
                        }
                        attachment.setUpdateTimestamp(currentTimestamp);
                        attachment.setUpdatedBy(loginPersonId);
                        attachmentRepository.save(attachment);
                    }
                }
            }
        }
    }

    public CmpTaskAttachment addNewTaskAttachment(CmpTaskAttachmentDto newAttachment, MultipartFile file, String fileName,
                                                  Integer documentId) {
        CmpTaskAttachment cmpTaskAttachment = new CmpTaskAttachment();
        try {
            if (newAttachment.getFileName().equals(fileName)) {
                cmpTaskAttachment.setFileName(fileName);
                cmpTaskAttachment.setContentType(newAttachment.getContentType());
                cmpTaskAttachment.setFileDataId(
                        fileManagementService.saveFile(Constants.COI_MANAGEMENT_PLAN_MODULE_CODE.toString(), file,
                                newAttachment.getTaskId().toString()));
                cmpTaskAttachment.setDocumentId(documentId);
            }
        } catch (IOException e) {
            log.error("Exception in method addNewSRTaskAttachment : {} ", e.getMessage());
            throw new ApplicationException("Error in addNewSRTaskAttachment", e, CoreConstants.JAVA_ERROR);
        }
        return cmpTaskAttachment;
    }

    private void deleteFilesById(String fileDataId) {
        fileManagementService.deleteFile(Constants.COI_MANAGEMENT_PLAN_MODULE_CODE.toString(), fileDataId);
    }

    @Override
    public CmpTaskDto getTaskByTaskId(Integer taskId) {
        Optional<CmpTask> task = cmpTaskRepository.findById(taskId);
        if (task.isPresent()) {
            return getCmpTaskDto(taskId, task.get());
        }
        throw new ResponseStatusException(HttpStatus.NO_CONTENT, "Task Not found for the given Id");
    }

    private CmpTaskDto getCmpTaskDto(Integer taskId, CmpTask task) {
        CmpTaskDto cmpTaskDto = new CmpTaskDto();
        BeanUtils.copyProperties(task, cmpTaskDto);
        cmpTaskDto.setCreateUserFullName(personDao.getPersonFullNameByPersonId(cmpTaskDto.getCreatedBy()));
        cmpTaskDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(cmpTaskDto.getUpdatedBy()));
        cmpTaskDto.setAssigneePersonName(personDao.getPersonFullNameByPersonId(cmpTaskDto.getAssigneePersonId()));
        cmpTaskDto.setCmpTaskAttachments(new ArrayList<>());
        attachmentRepository.findAllByTaskId(taskId).forEach(attachment -> {
            CmpTaskAttachmentDto attachmentDto = new CmpTaskAttachmentDto();
            BeanUtils.copyProperties(attachment, attachmentDto);
            attachmentDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(attachmentDto.getUpdatedBy()));
            cmpTaskDto.getCmpTaskAttachments().add(attachmentDto);
        });
        cmpTaskDto.setCmpTaskWatchers(new ArrayList<>());
        taskWatchersRepository.findAllByTaskId(taskId).forEach(watcher -> {
            CmpTaskWatchersDto watcherDto = new CmpTaskWatchersDto();
            BeanUtils.copyProperties(watcher, watcherDto);
            watcherDto.setWatcherPersonName(personDao.getPersonFullNameByPersonId(watcherDto.getWatcherPersonId()));
            cmpTaskDto.getCmpTaskWatchers().add(watcherDto);
        });
        List<CmpTaskQuestionsDto> quesAns = getTaskQuestions(taskId);
        cmpTaskDto.setCmpTaskQuestions(quesAns);
        cmpTaskDto.setCmpTaskComments(getTaskComments(taskId));
        return cmpTaskDto;
    }

    private List<CmpTaskQuestionsDto> getTaskQuestions(Integer taskId) {
        List<CmpTaskQuestionsDto> questionsAns = new ArrayList<>();
        questionsRepository.findAllByTaskId(taskId).forEach(que -> {
            CmpTaskQuestionsDto questionDto = new CmpTaskQuestionsDto();
            BeanUtils.copyProperties(que, questionDto);
            questionDto.setCmpTaskQuestionAnswers(new ArrayList<>());
            questionAnswersRepository.findAllByCmpTaskQuestionId(questionDto.getCmpTaskQuestionId()).forEach(ans -> {
                CmpTaskQuestionAnswersDto answerDto = new CmpTaskQuestionAnswersDto();
                BeanUtils.copyProperties(ans, answerDto);
                answerDto.setAnsweredPersonName(personDao.getPersonFullNameByPersonId(answerDto.getAnsweredBy()));
                questionDto.getCmpTaskQuestionAnswers().add(answerDto);
            });
            questionsAns.add(questionDto);
        });
        return questionsAns;
    }

    public List<CmpTaskCommentDto> getTaskComments(Integer taskId) {
        List<CmpTaskComment> comments = taskCommentRepository.findAllByTaskIdOrderByUpdateTimestampAsc(taskId);
        List<CmpTaskCommentDto> dtos = comments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        Map<Integer, CmpTaskCommentDto> dtoMap = dtos.stream()
                .collect(Collectors.toMap(CmpTaskCommentDto::getCmpTaskCommentId, d -> d));
        List<CmpTaskCommentDto> cmpStructuredComments = new ArrayList<>();
        for (CmpTaskCommentDto dto : dtos) {
            if (dto.getParentCommentId() == null) {
                cmpStructuredComments.add(dto);
            } else {
                CmpTaskCommentDto parent = dtoMap.get(dto.getParentCommentId());
                if (parent != null) {
                    if (parent.getChildComments() == null) {
                        parent.setChildComments(new ArrayList<>());
                    }
                    parent.getChildComments().add(dto);
                }
            }
        }
        return cmpStructuredComments;
    }

    private CmpTaskCommentDto convertToDto(CmpTaskComment c) {
        CmpTaskCommentDto dto = new CmpTaskCommentDto();
        dto.setCmpTaskCommentId(c.getCmpTaskCommentId());
        dto.setParentCommentId(c.getParentCommentId());
        dto.setTaskId(c.getTaskId());
        dto.setComment(c.getComment());
        dto.setIsPrivate(c.getIsPrivate());
        dto.setIsResolved(c.getIsResolved());
        dto.setResolvedBy(c.getResolvedBy());
        dto.setResolvedTimestamp(c.getResolvedTimestamp());
        dto.setUpdateTimestamp(c.getUpdateTimestamp());
        dto.setUpdatedBy(c.getUpdatedBy());
        if (c.getResolvedBy() != null) {
            dto.setResolvedPersonName(personDao.getPersonEmailByPersonId(c.getResolvedBy()));
        }
        return dto;
    }

    @Override
    public void deleteTask(Integer taskId) {
    	CmpTask task = cmpTaskRepository.findById(taskId)
    	        .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        attachmentRepository.findAllByTaskId(taskId).forEach(taskAttachment -> {
            deleteFilesById(taskAttachment.getFileDataId());
            attachmentRepository.deleteById(taskAttachment.getAttachmentId());
        });
        taskWatchersRepository.deleteAllByTaskId(taskId);
        questionsRepository.findAllByTaskId(taskId).forEach(question -> {
            questionAnswersRepository.deleteAllByCmpTaskQuestionId(question.getCmpTaskQuestionId());
            questionsRepository.deleteById(question.getCmpTaskQuestionId());
        });
        taskCommentRepository.deleteAllByTaskId(taskId);
        cmpTaskRepository.deleteById(taskId);
        String taskTypeDescription = cmpTaskTypeRepository.findById(task.getTaskTypeCode())
                .map(CmpTaskType::getDescription)
                .orElse(null);
		CmpTaskActionLogDto logDto = CmpTaskActionLogDto.builder().cmpId(task.getCmpId()).taskId(taskId)
				.assigneeName(task.getAssigneePersonId() != null
						? personDao.getPersonFullNameByPersonId(task.getAssigneePersonId())
						: null)
				.taskType(taskTypeDescription)
				.adminName(AuthenticatedUser.getLoginUserFullName()).build();
		actionLogService.saveCmpTaskActionLog(Constants.CMP_TASK_ACTION_LOG_DELETED, logDto);
    }

    @Override
    public Map<String, List<?>> getLookups() {
        return Map.of();
    }

    @Override
    public List<CmpTaskDto> getTasksByServiceRequestId(Integer cmpId) {
        List<CmpTaskDto> tasks = new ArrayList<>();
        cmpTaskRepository.findAllByCmpId(cmpId).forEach(task -> {
            CmpTaskDto cmpTaskDto = new CmpTaskDto();
            BeanUtils.copyProperties(task, cmpTaskDto);
            cmpTaskDto.setCreateUserFullName(personDao.getPersonFullNameByPersonId(cmpTaskDto.getCreatedBy()));
            cmpTaskDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(cmpTaskDto.getUpdatedBy()));
            cmpTaskDto.setAssigneePersonName(personDao.getPersonFullNameByPersonId(cmpTaskDto.getAssigneePersonId()));
            cmpTaskDto.setCmpTaskQuestions(getTaskQuestions(task.getTaskId()));
            tasks.add(cmpTaskDto);
        });
        return tasks;
    }

    @Override
    public List<CmpTaskDto> getAttachmentsByTaskId(Integer taskId) {
        List<CmpTaskAttachmentDto> attachments = new ArrayList<>();
        CmpTaskDto cmpTaskDto = new CmpTaskDto();
        attachmentRepository.findAllByTaskId(taskId).forEach(attachment -> {
            CmpTaskAttachmentDto attachmentDto = new CmpTaskAttachmentDto();
            BeanUtils.copyProperties(attachment, attachmentDto);
            attachmentDto.setUpdateUserFullName(personDao.getPersonFullNameByPersonId(attachmentDto.getUpdatedBy()));
            attachments.add(attachmentDto);
        });
        cmpTaskDto.setCmpTaskAttachments(attachments);
        return List.of(cmpTaskDto);
    }

    @Override
    public void deleteAttachment(Integer attachmentId) {
        CmpTaskAttachment attachment = attachmentRepository.findById(attachmentId).get();
        if (attachment == null) {
            throw new ApplicationException("Attachment not found", null, "deleteAttachment");
        }
        deleteFilesById(attachment.getFileDataId());
        attachmentRepository.deleteById(attachment.getAttachmentId());
    }

    @Override
    public ResponseEntity<byte[]> downloadAttachment(Integer attachmentId) {
        CmpTaskAttachment attachment = attachmentRepository.findById(attachmentId).get();
        if (attachment == null) {
            throw new ApplicationException("Attachment not found", null, "downloadAttachment");
        }
        ResponseEntity<byte[]> attachmentData = null;
        try {
            attachmentData = commonService.setAttachmentContent(attachment.getFileName(), fileManagementService
                    .getFileData(Constants.COI_MANAGEMENT_PLAN_MODULE_CODE.toString(), attachment.getFileDataId()));
        } catch (Exception e) {
            log.error("Exception in downloadAttachment : {}", e.getMessage());
        }
        return attachmentData;
    }

    @Override
    public Class<CmpTaskDto> getDtoClass() {
        return CmpTaskDto.class;
    }

    public CmpTaskQuestionAnswers saveQuestionAns(CmpTaskQuestionAnswers cmpTaskQuestionAnswer) {
        String loginPersonId = AuthenticatedUser.getLoginPersonId();
        cmpTaskQuestionAnswer.setAnsweredBy(loginPersonId);
        cmpTaskQuestionAnswer.setUpdateTimestamp(commonDao.getCurrentTimestamp());
        cmpTaskQuestionAnswer.setUpdatedBy(loginPersonId);
        return questionAnswersRepository.save(cmpTaskQuestionAnswer);
    }

    public List<CmpTaskDto> getTaskByTaskByCmpIdAndPersonId(Integer cmpId, String personId) {
        List<CmpTask> tasks = cmpTaskRepository.findByCmpIdAndAssigneePersonId(cmpId, personId);
        if (tasks != null && !tasks.isEmpty()) {
            List<CmpTaskDto> taskDtos = new ArrayList<>();
            for (CmpTask task : tasks) {
                taskDtos.add(getCmpTaskDto(task.getTaskId(), task));
            }
            return taskDtos;
        }
        return Collections.emptyList();
    }
}
