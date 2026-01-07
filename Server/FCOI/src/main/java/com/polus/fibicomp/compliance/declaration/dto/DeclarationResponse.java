package com.polus.fibicomp.compliance.declaration.dto;

import java.util.List;

import com.polus.fibicomp.compliance.declaration.pojo.CoiDeclaration;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeclarationResponse {

	private CoiDeclaration declaration;
	private List<CoiDeclaration> declarations;
}
