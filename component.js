Vue.component('substitute-select', {
	template: `
		<div>
			<users-filter @filter="search"></users-filter>
			<users-selection-table 
				v-model="substitute" 
				v-bind:users="users" 
				select-message="Definir Substituto">
			</users-selection-table>
		</div>
	`,
	data: function(){
		return {
			substitute : {},
			users: [
				{
					id: 1,
					registration: "102122",
					name: "Jefferson Martins Cardoso",
					allocation: "Gabinete do Prefeito"
				},
				{
					id: 2,
					registration: "102122",
					name: "Jefferson Martins Cardoso",
					allocation: "Gabinete do Prefeito"
				},
				{
					id: 3,
					registration: "102122",
					name: "Jefferson Martins Cardoso",
					allocation: "Gabinete do Prefeito"
				},
				{
					id: 4,
					registration: "102122",
					name: "Jefferson Martins Cardoso",
					allocation: "Gabinete do Prefeito"
				}

			]
		}
	},
	methods: {
		search : function(attributes){
			
		},
		defineSubstitute: function(){

		}
	}
});


Vue.component('users-selection-table', {
	props: ['users', 'select-message'],
	template: `
		<div>
			<table class="table" v-if="hasUsers">
				<thead>
					<tr>
						<th style="width: 5%">Matrícula</th>
						<th style="width: 40%">Nome</th>
						<th style="width: 45%">Lotação</th>
						<th style="width: 10%">Selecionar</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="user in users">
						<td>{{ user.registration }}</td>
						<td>{{ user.name }}</td>
						<td>{{ user.allocation }}</td>
						<td>
							<input type="radio" v-model="substitute" name="substitute" v-bind:value="user.id"/>
						</td>
					</tr>
				</tbody>
			</table>

			<button class="btn btn-primary pull-right" v-bind:disabled="!substitute">{{ this.selectMessage }}</button>
		</div>
	`,
	data: function(){
		return {
			substitute: null
		}
	},
	computed: {
		hasUsers : function(){ return this.users.length > 0; }
	}

});


Vue.component('users-filter', {
	template: `<div>
		
		<div class="row">
			<div class="form-group col-md-3">	
				<label>CPF</label>
				<input class="form-control" v-model="cpf" type="text" />
			</div>
			
			<div class="form-group col-md-3">	
				<label>Matrícula</label>
				<input class="form-control" v-model="registration" type="text" />
			</div>

			<div class="form-group col-md-6">	
				<label>Nome</label>
				<input class="form-control" v-model="name" type="text" />
			</div>
		</div>
		
		<organization-chart-select @change="setOrganization"></organization-chart-select>

		<button class="btn btn-primary pull-right" @click="onSearchButton()">Buscar</button>
	</div>
	`,

	data: function(){
		return {
			cpf : "",
			name: "",
			registration: "",
			organization: {},
		}
	},
	methods: {
		setOrganization : function(organization){
			this.organization = organization;
		},
		onSearchButton: function(){
			this.$emit('filter',{
				cpf: this.cpf,
				registration: this.registration,
				name: this.name,
				organization: this.organization
			});
		}
	}
})


Vue.component('organization-chart-select', {
	props: ['source'],
	created: function(){
		var organizationChart;
		var url = (this.source != undefined) ? this.source : 'organization-chart.json';
		$.ajax({
	        url: url,
	        success: function (result) { organizationChart = result; },
	        dataType: 'json',
	        async: false
	    });

	    this.organizationChart = organizationChart;
	},
	template: `
		<div>
			<div class="form-group">	
				<label>Secretaria/Orgão</label>
				<select class="form-control" v-model="secretariatId">
					<option v-for="secretariat in getSecretaries()" v-bind:value="secretariat.id">{{ secretariat.name }}</option>
				</select>
			</div>

			<div class="form-group">	
				<label>Diretoria</label>
				<select class="form-control" v-model="directionId" :disabled="directories.length == 0">
					<option v-for="direction in directories" v-bind:value="direction.id">{{ direction.name }}</option>
				</select>
			</div>

			<div class="form-group">	
				<label>Unidade</label>
				<select class="form-control" v-model="unitId" :disabled="units.length == 0">
					<option v-for="unit in units" v-bind:value="unit.id">{{ unit.name }}</option>
				</select>
			</div>

			<div class="form-group">	
				<label>Equipe</label>
				<select class="form-control" v-model="teamId" :disabled="teams.length == 0">
					<option v-for="team in teams" v-bind:value="team.id">{{ team.name }}</option>
				</select>
			</div>
		</div>
	`,
	data: function () {
		return {
			secretariatId : "",
			directionId   : "",
			unitId        : "",
			teamId        : "",

			organizationChart: [],
			directories : [],
			units 		: [],
			teams 		: [],
		};
	},
	methods: {
		getSecretaries : function(){
			return this.organizationChart;
		},
		findEntity: function(id, entities){
			for(i in entities){
				if(entities[i].id == id) return entities[i];
			}
		},
		emitChangeEvent: function(){
			this.$emit('change', {
				secretariat : this.secretariatId,
				direction   : this.directionId,
				unit        : this.unitId,
				team        : this.teamId,
			})
		}
	},
	computed: {
		secretariat : function(){
			this.emitChangeEvent();
			return this.findEntity(this.secretariatId, this.organizationChart);
		},
		direction : function(){
			this.emitChangeEvent();
			return this.findEntity(this.directionId, this.secretariat.childrens);
		},
		unit : function(){
			this.emitChangeEvent();
			return this.findEntity(this.unitId, this.direction.childrens);
		},
		team : function(){
			this.emitChangeEvent();
			return this.findEntity(this.teamId, this.unit.childrens);
		}
	},
	watch: {
		secretariatId: function(){
			this.directories = this.secretariat.childrens;
	    	this.units = [];
	    	this.teams = [];
		},
		directionId: function(){
			this.units = this.direction.childrens;
	    	this.teams = [];
		},
		unitId: function(){
			this.teams = this.unit.childrens;
		},
		teamId: function(){ }
	}
});